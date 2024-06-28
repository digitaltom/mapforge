import { basemaps } from 'maplibre/basemaps'
import { draw } from 'maplibre/edit'
import { resetControls } from 'maplibre/controls'
import { initializeViewStyles } from 'maplibre/styles'
import { AnimatePointAnimation } from 'maplibre/animations'
import * as functions from 'helpers/functions'
import { status } from 'helpers/status'
import maplibregl from 'maplibre-gl'

// eslint expects variables to get imported, but we load the full lib in header
const maptilersdk = window.maptilersdk
const maplibreglMaptilerGeocoder = window.maplibreglMaptilerGeocoder

export let map
export let geojsonData //= { type: 'FeatureCollection', features: [] }
export let mapProperties
export let lastMousePosition
export let highlightedFeature
let backgroundMapLayer

// workflow of event based map loading:
//
// * initializeMap() - set map object
// * setup map callbacks (initializeViewMode(), initializeEditMode())
// * setBackgroundMapLayer() -> 'style.load' event
//   -> initializeDefaultControls(), loadGeoJsonData() -> 'geojson.load' event
//      -> triggers callbacks for setting geojson/draw style layers,
//         sets data-geojson-loaded attribute to true

export function initializeMaplibreProperties () {
  mapProperties = window.gon.map_properties
  console.log('map properties: ' + JSON.stringify(mapProperties))
  geojsonData = null
  if (mapProperties.name) { document.title = 'mapforge.org - ' + mapProperties.name }
}

export function initializeMap (divId = 'maplibre-map') {
  // reset map data
  geojsonData = null
  backgroundMapLayer = null

  initializeMaplibreProperties()
  maptilersdk.config.apiKey = window.gon.map_keys.maptiler
  map = new maplibregl.Map({
    container: divId,
    center: mapProperties.center,
    zoom: mapProperties.zoom,
    pitch: mapProperties.pitch,
    maxPitch: 72,
    interactive: (window.gon.map_mode !== 'static') // can move/zoom map
    // style: {} // style/map is getting loaded by 'setBackgroundMapLayer'
  })
  // for console debugging
  window.map = map

  // after basemap style is ready/changed, load geojson layer
  map.on('style.load', () => {
    status('Map style loaded')
    loadGeoJsonData()
    if (mapProperties.terrain && window.gon.map_keys.maptiler) { addTerrain() }
  })

  map.on('geojson.load', function (e) {
    functions.e('#maplibre-map', e => { e.setAttribute('data-geojson-loaded', true) })
  })

  map.on('mousemove', (e) => {
    lastMousePosition = e.lngLat
  })
  map.on('touchend', (e) => {
    lastMousePosition = e.lngLat
  })

  map.on('click', resetControls)
  map.on('touchstart', resetControls)

  functions.e('#map-title', e => { e.textContent = mapProperties.name })
}

function loadGeoJsonData () {
  // https://maplibre.org/maplibre-style-spec/sources/#geojson
  map.addSource('geojson-source', {
    type: 'geojson',
    promoteId: 'id',
    data: { type: 'FeatureCollection', features: [] }, // geojsonData,
    cluster: false
  })

  if (geojsonData) {
    // data is already loaded
    map.getSource('geojson-source').setData(geojsonData)
    map.fire('geojson.load', { detail: { message: 'geojson-source cached' } })
    return
  }

  const url = '/m/' + window.gon.map_id + '/features'
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log('loaded GeoJSON data: ', JSON.stringify(data))
      geojsonData = data
      if (geojsonData.features.length > 0) {
        console.log('loaded ' + geojsonData.features.length + ' features from ' + url)
        // this is a workaround for the maplibre limitation of numeric ids:
        // https://github.com/mapbox/mapbox-gl-js/issues/2716
        geojsonData.features.forEach(feature => { feature.properties.id = feature.id })
        map.getSource('geojson-source').setData(geojsonData)
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
    const gc = new maplibreglMaptilerGeocoder.GeocodingControl({
      apiKey: window.gon.map_keys.maptiler,
      class: 'search-form'
    })
    map.addControl(gc, 'top-right')
  }

  const nav = new maplibregl.NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true
  })
  map.addControl(nav)

  const locate = new maptilersdk.MaptilerGeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  })
  map.addControl(locate, 'top-right')

  const scale = new maptilersdk.ScaleControl({
    maxWidth: 80,
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

export function upsert (updatedFeature) {
  const feature = geojsonData.features.find(feature => feature.id === updatedFeature.id)
  if (!feature) {
    updatedFeature.properties.id = updatedFeature.id
    geojsonData.features.push(updatedFeature)
    status('Added feature ' + updatedFeature.id)
  } else {
    if (feature.geometry.type === 'Point') {
      const newCoords = updatedFeature.geometry.coordinates
      if (!functions.arraysEqual(feature.geometry.coordinates, newCoords)) {
        const animation = new AnimatePointAnimation()
        animation.animatePoint(feature, newCoords)
      }
    } else {
      feature.geometry = updatedFeature.geometry
    }
    feature.properties = updatedFeature.properties
    status('Updated feature ' + updatedFeature.id)
  }
  if (draw) { draw.set(geojsonData) }
  map.getSource('geojson-source').setData(geojsonData)
}

export function destroy (featureId) {
  status('Deleting feature ' + featureId)
  geojsonData.features = geojsonData.features.filter(feature => feature.id !== featureId)
  if (draw) { draw.set(geojsonData) }
  map.getSource('geojson-source').setData(geojsonData)
}

export function setBackgroundMapLayer (mapName = mapProperties.base_map, force = false) {
  if (backgroundMapLayer === mapName && !force) { return }
  if (basemaps[mapName]) {
    status('Loading base map ' + mapName)
    map.setStyle(basemaps[mapName],
    // adding this so that 'style.load' gets triggered (https://github.com/maplibre/maplibre-gl-js/issues/2587)
      { diff: false })
    backgroundMapLayer = mapName
  } else {
    console.error('Base map ' + mapName + ' not available!')
  }
}
