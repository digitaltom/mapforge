import { basemaps } from 'maplibre/basemaps'
import { draw } from 'maplibre/edit'
import { resetControls, initSettingsModal } from 'maplibre/controls'
import { initializeViewStyles } from 'maplibre/styles'
import { highlightFeature, resetHighlightedFeature } from 'maplibre/feature'
import { AnimatePointAnimation } from 'maplibre/animations'
import * as functions from 'helpers/functions'
import { status } from 'helpers/status'
import maplibregl from 'maplibre-gl'
import { GeocodingControl } from 'maptiler-geocoding-control'

export let map
export let geojsonData //= { type: 'FeatureCollection', features: [] }
export let mapProperties
export let lastMousePosition
export let highlightedFeature
let mapInteracted
let backgroundMapLayer
let backgroundTerrain

// workflow of event based map loading:
// page calls: initializeMap(), [initializeSocket()],
// initializeViewMode() or initializeEditMode() or initializeStaticMode()
// setBackgroundMapLayer() -> 'style.load' event
// 'style.load' -> initializeDefaultControls()
// 'style.load' -> loadGeoJsonData() -> 'geojson.load'
// 'geojson.load' -> initializeViewStyles()

export function initializeMaplibreProperties () {
  const lastProperties = JSON.parse(JSON.stringify(mapProperties || {}))
  mapProperties = window.gon.map_properties
  if (JSON.stringify(lastProperties) !== JSON.stringify(mapProperties)) {
    console.log('update map properties: ' + JSON.stringify(mapProperties))
    updateMapName(mapProperties.name)
    initSettingsModal()
    status('Map properties updated')
    if (Object.keys(lastProperties).length === 0 || !mapProperties) { return }
    // animate to new view if map had no interaction yet
    if (!mapInteracted && JSON.stringify(lastProperties) !== JSON.stringify(mapProperties)) {
      setViewFromProperties()
    }
  }
}

export function setViewFromProperties () {
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
    console.log('Map style loaded')
    loadGeoJsonData()
    if (mapProperties.terrain && window.gon.map_keys.maptiler) { addTerrain() }
  })

  map.on('geojson.load', (e) => {
    functions.e('#maplibre-map', e => { e.setAttribute('data-geojson-loaded', true) })
    const urlFeatureId = new URLSearchParams(window.location.search).get('f')
    const feature = geojsonData.features.find(f => f.id === urlFeatureId)
    if (feature) {
      highlightFeature(feature, true)
      const centroid = window.turf.center(feature)
      map.setCenter(centroid.geometry.coordinates)
    }
  })

  map.once('load', function (e) {
    // re-sort layers late, when all map, view + edit layers are added
    sortLayers()
    functions.e('#maplibre-map', e => { e.setAttribute('data-loaded', true) })
    console.log('Map loaded')
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
  const url = host + '/m/' + window.gon.map_id + '.geojson'
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      // console.log('loaded GeoJSON from server: ', JSON.stringify(data))
      geojsonData = data
      if (geojsonData.features.length > 0) {
        console.log('loaded ' + geojsonData.features.length + ' features from ' + url)
        // this + `promoteId: 'id'` is a workaround for the maplibre limitation:
        // https://github.com/mapbox/mapbox-gl-js/issues/2716
        // because to highlight a feature we need the id,
        // and in the style layers it only accepts mumeric ids in the id field initially
        geojsonData.features.forEach((feature, index) => { feature.properties.id = feature.id })

        redrawGeojson()
        // drop the properties.id after sending to the map
        geojsonData.features.forEach(feature => { delete feature.properties.id })
      }
      console.log('Geojson layer loaded')
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
    trackUserLocation: functions.isMobileDevice()
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
}

export function initializeStaticMode () {
  map.on('geojson.load', () => {
    initializeViewStyles()
  })
}

export function initializeViewMode () {
  map.once('style.load', () => { initializeDefaultControls() })
  map.on('geojson.load', () => { initializeViewStyles() })
}

export function redrawGeojson (resetDraw = true) {
  // draw has its own style layers based on editStyles
  if (draw) {
    if (resetDraw) {
      // This has a performance drawback over draw.set(), but otherwise
      // feature properties like color don't get updated
      // API: https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
      draw.deleteAll()
      draw.add(geojsonData)
    } else {
      draw.set(geojsonData)
    }
  }
  map.getSource('geojson-source')?.setData(renderedGeojsonData())
  map.redraw()
}

// change geojson data before rendering:
// - For LineStrings with a 'fill-extrusion-height', add a polygon to render extrusion
export function renderedGeojsonData () {
  let extrusionLines = geojsonData.features.filter(feature => (
    feature.geometry.type === 'LineString' &&
      feature.properties['fill-extrusion-height'] &&
      feature.geometry.coordinates.length !== 1 // don't break line animation
  ))

  extrusionLines = extrusionLines.map(feature => {
    const width = feature.properties['fill-extrusion-width'] || feature.properties['stroke-width'] * 2 || 4
    const extrusionLine = window.turf.buffer(feature, width, { units: 'meters' })
    // clone properties hash, else we're writing into the original feature's properties
    extrusionLine.properties = { ...feature.properties }
    if (!extrusionLine.properties['fill-extrusion-color'] && feature.properties.stroke) {
      extrusionLine.properties['fill-extrusion-color'] = feature.properties.stroke
    }
    extrusionLine.properties['stroke-width'] = 0
    extrusionLine.properties['stroke-opacity'] = 0
    extrusionLine.properties['fill-opacity'] = 0
    return extrusionLine
  })
  return { type: 'FeatureCollection', features: geojsonData.features.concat(extrusionLines) }
}

export function upsert (updatedFeature) {
  const feature = geojsonData.features.find(f => f.id === updatedFeature.id)
  if (!feature) {
    addFeature(updatedFeature)
  } else if (JSON.stringify(updatedFeature) !== JSON.stringify(feature)) {
    updateFeature(feature, updatedFeature)
  }
}

export function addFeature (feature) {
  feature.properties.id = feature.id
  geojsonData.features.push(feature)
  redrawGeojson()
  status('Added feature ' + feature.id)
}

function updateFeature (feature, updatedFeature) {
  if (feature.geometry.type === 'Point') {
    const newCoords = updatedFeature.geometry.coordinates
    if (!functions.arraysEqual(feature.geometry.coordinates, newCoords)) {
      const animation = new AnimatePointAnimation()
      animation.animatePoint(feature, newCoords)
    }
  }
  // only update feature if it was changed
  if (JSON.stringify(feature.geometry) !== JSON.stringify(updatedFeature.geometry) ||
    JSON.stringify(feature.properties) !== JSON.stringify(updatedFeature.properties)) {
    feature.geometry = updatedFeature.geometry
    feature.properties = updatedFeature.properties
    status('Updated feature ' + updatedFeature.id)
    redrawGeojson()
  }
}

export function destroy (featureId) {
  if (geojsonData.features.find(f => f.id === featureId)) {
    status('Deleting feature ' + featureId)
    geojsonData.features = geojsonData.features.filter(f => f.id !== featureId)
    redrawGeojson()
    resetHighlightedFeature()
  }
}

export function setBackgroundMapLayer (mapName = mapProperties.base_map, force = false) {
  if (backgroundMapLayer === mapName && backgroundTerrain === mapProperties.terrain && !force) { return }
  if (basemaps[mapName]) {
    map.once('style.load', () => { status('Loaded base map ' + mapName) })
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

// re-sort layers to overlay geojson layers with labels & extrusion objects
// sorting:
// - extrusions
// - text/symbol
export function sortLayers () {
  console.log(map.getStyle().layers)
  console.log('Sorting layers')
  const currentStyle = map.getStyle()
  let layers = currentStyle.layers

  const userExtrusions = layers.filter(l => l.properties &&
    (l.properties['fill-extrusion-height'] || l.properties['user_fill-extrusion-height']))

  let result = functions.reduceArray(layers, (e) => e.paint && e.paint['fill-extrusion-height'])
  const mapExtrusions = result[0]
  layers = result[1]
  // increase opacity of 3D houses
  mapExtrusions.filter(l => l.id === 'Building 3D').forEach((layer) => {
    layer.paint['fill-extrusion-opacity'] = 0.8
  })

  result = functions.reduceArray(layers, (e) => e.type === 'symbol')
  const symbols = result[0]
  layers = result[1]

  result = functions.reduceArray(layers, (e) => e.layout && e.layout['text-field'])
  const mapLabels = result[0]
  layers = result[1]

  layers = layers.concat(mapExtrusions).concat(mapLabels).concat(symbols)
  const newStyle = { ...currentStyle, layers }
  map.setStyle(newStyle, { diff: true })
  console.log(map.getStyle().layers)
}

export function updateMapName (name) {
  if (!document.getElementById('frontpage-map')) {
    mapProperties.name = name
    if (mapProperties.name) {
      document.title = 'Mapforge.org: Map "' + mapProperties.name + '"'
    }
    functions.e('#map-title', e => { e.textContent = mapProperties.name })
  }
}
