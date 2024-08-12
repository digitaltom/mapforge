import { basemaps } from 'maplibre/basemaps'
import { draw, selectedFeature } from 'maplibre/edit'
import { resetControls, initSettingsModal } from 'maplibre/controls'
import { initializeViewStyles, highlightFeature, resetHighlightedFeature } from 'maplibre/styles'
import { AnimatePointAnimation } from 'maplibre/animations'
import * as functions from 'helpers/functions'
import { status } from 'helpers/status'
import maplibregl from 'maplibre-gl'
import { GeocodingControl } from 'maptiler-geocoding-control'

// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

export let map
export let geojsonData //= { type: 'FeatureCollection', features: [] }
export let mapProperties
export let lastMousePosition
export let highlightedFeature
let mapInteracted
let backgroundMapLayer
let backgroundTerrain

// workflow of event based map loading:
//
// * initializeMap() - set map object
// * setup map callbacks (initializeViewMode(), initializeEditMode())
// * setBackgroundMapLayer() -> 'style.load' event
//   -> initializeDefaultControls(), loadGeoJsonData() -> 'geojson.load' event
//      -> triggers callbacks for setting geojson/draw style layers,
//         sets data-geojson-loaded attribute to true

export function initializeMaplibreProperties () {
  const lastProperties = JSON.parse(JSON.stringify(mapProperties || {}))
  mapProperties = window.gon.map_properties
  // console.log('last properties: ' + JSON.stringify(lastProperties))
  console.log('init with map properties: ' + JSON.stringify(mapProperties))
  if (mapProperties.name) { document.title = 'mapforge.org - ' + mapProperties.name }
  functions.e('#map-title', e => { e.textContent = mapProperties.name })
  initSettingsModal()
  status('Map properties updated')
  if (Object.keys(lastProperties).length === 0 || !mapProperties) { return }
  // animate to new view if map had no interaction yet
  if (!mapInteracted && JSON.stringify(lastProperties) !== JSON.stringify(mapProperties)) {
    setViewFromProperties()
  }
}

function setViewFromProperties () {
  map.once('moveend', function () { status('Map view updated') })
  map.flyTo({
    center: mapProperties.center || mapProperties.default_center,
    zoom: mapProperties.zoom || mapProperties.default_zoom,
    pitch: mapProperties.pitch,
    bearing: mapProperties.bearing || 0,
    curve: 0.3,
    essential: true,
    duration: 2000
  })
}

export function resetGeojsonData () {
  geojsonData = null
}

export function initializeMap (divId = 'maplibre-map') {
  // reset map data
  geojsonData = null
  backgroundMapLayer = null

  initializeMaplibreProperties()
  map = new maplibregl.Map({
    container: divId,
    center: (mapProperties.center || mapProperties.default_center),
    zoom: (mapProperties.zoom || mapProperties.default_zoom),
    pitch: mapProperties.pitch,
    bearing: mapProperties.bearing || 0,
    maxPitch: 72,
    interactive: (window.gon.map_mode !== 'static') // can move/zoom map
    // style: {} // style/map is getting loaded by 'setBackgroundMapLayer'
  })
  // for console debugging
  window.map = map
  window.maplibregl = maplibregl

  // after basemap style is ready/changed, load geojson layer
  map.on('style.load', () => {
    status('Map style loaded')
    loadGeoJsonData()
    if (mapProperties.terrain && window.gon.map_keys.maptiler) { addTerrain() }
  })

  map.on('geojson.load', (e) => {
    functions.e('#maplibre-map', e => { e.setAttribute('data-geojson-loaded', true) })
    const urlFeatureId = new URLSearchParams(window.location.search).get('f')
    const feature = geojsonData.features.find(f => f.id === urlFeatureId)
    if (feature) {
      highlightFeature(feature, true)
      const centroid = turf.center(feature)
      map.setCenter(centroid.geometry.coordinates)
    }
  })

  map.on('mousemove', (e) => { lastMousePosition = e.lngLat })
  map.on('touchend', (e) => { lastMousePosition = e.lngLat })
  map.on('drag', () => { mapInteracted = true })
  map.on('click', resetControls)
  map.on('pitchend', function (e) {
    functions.e('#settings-modal', e => {
      e.dataset.settingsCurrentPitchValue = map.getPitch().toFixed(0)
    })
  })
  map.on('zoomend', function (e) {
    functions.e('#settings-modal', e => {
      e.dataset.settingsCurrentZoomValue = map.getZoom().toFixed(2)
    })
  })
  map.on('rotate', function (e) {
    functions.e('#settings-modal', e => {
      e.dataset.settingsCurrentBearingValue = map.getBearing().toFixed(0)
    })
  })
  map.on('moveend', function (e) {
    functions.e('#settings-modal', e => {
      e.dataset.settingsCurrentCenterValue = JSON.stringify([map.getCenter().lng, map.getCenter().lat])
    })
  })
}

export function loadGeoJsonData () {
  // https://maplibre.org/maplibre-style-spec/sources/#geojson
  map.addSource('geojson-source', {
    type: 'geojson',
    promoteId: 'id',
    data: { type: 'FeatureCollection', features: [] }, // geojsonData,
    cluster: false
  })

  if (geojsonData) {
    // data is already loaded
    redrawGeojson()
    map.fire('geojson.load', { detail: { message: 'redraw cached geojson-source' } })
    return
  }

  const host = new URL(window.location.href).origin
  const url = host + '/m/' + window.gon.map_id + '/features'
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log('loaded GeoJSON from server: ', JSON.stringify(data))
      geojsonData = data
      if (geojsonData.features.length > 0) {
        console.log('loaded ' + geojsonData.features.length + ' features from ' + url)
        // this + `promoteId: 'id'` is a workaround for the maplibre limitation:
        // https://github.com/mapbox/mapbox-gl-js/issues/2716
        // because to highlight a feature we need the id,
        // and in the style layers it only accepts mumeric ids in the id field initially
        geojsonData.features.forEach(feature => { feature.properties.id = feature.id })
        redrawGeojson()
        // drop the properties.id after sending to the map
        geojsonData.features.forEach(feature => { delete feature.properties.id })
      }
      status('Geojson layer loaded')
      map.fire('geojson.load', { detail: { message: 'geojson-source loaded' } })
    })
    .catch(error => {
      console.error('Failed to fetch GeoJSON:', error)
      console.error('geojsonData: ' + JSON.stringify(geojsonData))
    })
}

function addTerrain () {
  map.addSource('terrain', {
    type: 'raster-dem',
    url: 'https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=' + window.gon.map_keys.maptiler
  })

  map.setTerrain({
    source: 'terrain',
    exaggeration: 1.3
  })
  status('Terrain added to map')
}

export function initializeDefaultControls () {
  // https://docs.maptiler.com/sdk-js/modules/geocoding/api/api-reference/#geocoding-options
  if (window.gon.map_keys.maptiler) {
    const gc = new GeocodingControl({
      apiKey: window.gon.map_keys.maptiler,
      class: 'search-form',
      marker: false, // TODO rendering markers is broken with maplibre importmap
      maplibregl
    })
    map.addControl(gc, 'top-right')
  }

  const nav = new maplibregl.NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true
  })
  map.addControl(nav)

  // https://maplibre.org/maplibre-gl-js/docs/API/classes/GeolocateControl
  // Note: This might work only via https
  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
  geolocate.on('error', () => {
    status('Error detecting location', 'warning')
  })
  map.addControl(geolocate, 'top-right')

  const scale = new maplibregl.ScaleControl({
    maxWidth: 100,
    unit: 'metric'
  })
  map.addControl(scale)
  scale.setUnit('metric')
  status('Controls added to map')
}

export function initializeStaticMode () {
  map.on('geojson.load', function (e) {
    initializeViewStyles()
  })
}

export function initializeViewMode () {
  map.once('style.load', () => {
    initializeDefaultControls()
  })

  map.on('geojson.load', function (e) {
    initializeViewStyles()
  })
}

export function redrawGeojson () {
  if (draw) {
    draw.set(geojsonData)
    // force re-draw of selected feature
    draw.changeMode('simple_select', { featureIds: [selectedFeature?.id] })
  }
  map.getSource('geojson-source')?.setData(geojsonData)
}

export function upsert (updatedFeature) {
  const feature = geojsonData.features.find(f => f.id === updatedFeature.id)
  if (!feature) {
    addFeature(updatedFeature)
  } else if (JSON.stringify(updatedFeature) !== JSON.stringify(feature)) {
    updateFeature(feature, updatedFeature)
  }
}

function addFeature (feature) {
  feature.properties.id = feature.id
  geojsonData.features.push(feature)
  status('Added feature ' + feature.id)
  redrawGeojson()
}

function updateFeature (feature, updatedFeature) {
  if (feature.geometry.type === 'Point') {
    const newCoords = updatedFeature.geometry.coordinates
    if (!functions.arraysEqual(feature.geometry.coordinates, newCoords)) {
      const animation = new AnimatePointAnimation()
      animation.animatePoint(feature, newCoords)
    }
  }
  feature.geometry = updatedFeature.geometry
  feature.properties = updatedFeature.properties
  status('Updated feature ' + updatedFeature.id)
  redrawGeojson()
}

export function destroy (featureId) {
  status('Deleting feature ' + featureId)
  geojsonData.features = geojsonData.features.filter(f => f.id !== featureId)
  redrawGeojson()
  resetHighlightedFeature()
}

export function setBackgroundMapLayer (mapName = mapProperties.base_map, force = false) {
  if (backgroundMapLayer === mapName && backgroundTerrain === mapProperties.terrain && !force) { return }
  if (basemaps[mapName]) {
    status('Loading base map ' + mapName)
    map.setStyle(basemaps[mapName],
      // adding 'diff: false' so that 'style.load' gets triggered (https://github.com/maplibre/maplibre-gl-js/issues/2587)
      // which will trigger loadGeoJsonData()
      { diff: false, strictMode: true })
    backgroundMapLayer = mapName
    backgroundTerrain = mapProperties.terrain
  } else {
    console.error('Base map ' + mapName + ' not available!')
  }
}
