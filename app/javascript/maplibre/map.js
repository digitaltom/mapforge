import { basemaps } from 'maplibre/basemaps'
import { draw } from 'maplibre/edit'
import { initializeViewStyles } from 'maplibre/styles'
import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header
const maplibregl = window.maplibregl
const maptilersdk = window.maptilersdk
const maplibreglMaptilerGeocoder = window.maplibreglMaptilerGeocoder
const turf = window.turf

export let map
export let geojsonData //= { type: 'FeatureCollection', features: [] }
export let mapProperties
export let lastMousePosition

// workflow of event based map loading:
//
// * initializeMap() - set map object
// * setup map callbacks (initializeViewMode(), initializeEditMode())
// * setBackgroundMapLayer() -> 'style.load' event
//   -> loadGeoJsonData() -> 'geojson.load' event
//      -> triggers callbacks for setting geojson/draw style layers
export function initializeMaplibreProperties () {
  mapProperties = window.gon.map_properties
  console.log('map properties: ' + JSON.stringify(mapProperties))
  geojsonData = null
  if (mapProperties.name) { document.title = 'mapforge.org - ' + mapProperties.name }
}

export function initializeMap (divId = 'maplibre-map') {
  // reset map data
  geojsonData = null

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
    loadGeoJsonData()
    if (mapProperties.terrain) { addTerrain() }
  })

  map.on('mousemove', (e) => {
    lastMousePosition = e.lngLat
  })
  map.on('touchend', (e) => {
    lastMousePosition = e.lngLat
  })

  functions.e('#map-title', e => { e.textContent = mapProperties.name })
}

function loadGeoJsonData () {
  // https://maplibre.org/maplibre-style-spec/sources/#geojson
  map.addSource('geojson-source', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }, // geojsonData,
    cluster: false
  })

  if (geojsonData) {
    // data is already loaded
    map.getSource('geojson-source').setData(geojsonData)
    map.fire('geojson.load', { detail: { message: 'geojson-source loaded' } })
    return
  }

  fetch('/maps/' + window.gon.map_id + '/features')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      console.log('loaded GeoJSON data: ', data)
      geojsonData = data
      console.log('loaded ' + geojsonData.features.length +
        ' features from ' + '/maps/' + window.gon.map_id + '/features')
      map.getSource('geojson-source').setData(geojsonData)
      map.fire('geojson.load', { detail: { message: 'geojson-source loaded' } })
    })
    .catch(error => {
      console.error('Failed to fetch GeoJSON:', error)
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
}

export function initializeControls () {
  map._controls.forEach((control) => {
    map.removeControl(control)
  })

  // https://docs.maptiler.com/sdk-js/modules/geocoding/api/api-reference/#geocoding-options
  const gc = new maplibreglMaptilerGeocoder.GeocodingControl({
    apiKey: window.gon.map_keys.maptiler,
    class: 'search-form'
  })
  map.addControl(gc, 'top-right')

  map.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    })
  )

  map.addControl(new maptilersdk.MaptilerGeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }), 'top-right')

  const scale = new maptilersdk.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
  })
  map.addControl(scale)

  scale.setUnit('metric')
}

export function initializeStaticMode () {
  map.on('geojson.load', function (e) {
    initializeViewStyles()
  })
}

export function initializeViewMode () {
  map.on('style.load', () => {
    initializeControls()
  })

  map.on('geojson.load', function (e) {
    initializeViewStyles()
  })

  map.on('click', 'line-layer', function (e) {
    if (e.features.length === 1) {
      const clickedFeature = e.features[0]
      console.log('Clicked feature:', clickedFeature)

      if (clickedFeature.geometry.type === 'LineString') {
        const turfLineString = turf.lineString(clickedFeature.geometry.coordinates)
        const length = turf.length(turfLineString)
        console.log('Length: ' + length + 'km')
      }
    }
  })
}

export function upsert (updatedFeature) {
  const feature = geojsonData.features.find(feature => feature.id === updatedFeature.id)
  if (!feature) {
    console.log('Adding feature ' + updatedFeature.id)
    geojsonData.features.push(updatedFeature)
  } else {
    console.log('Updating feature ' + updatedFeature.id)
    if (feature.geometry.type === 'Point') {
      const newCoords = updatedFeature.geometry.coordinates
      if (!functions.arraysEqual(feature.geometry.coordinates, newCoords)) {
        animatePoint(feature, newCoords)
      }
    } else {
      feature.geometry = updatedFeature.geometry
    }
    feature.properties = updatedFeature.properties
  }
  if (draw) { draw.set(geojsonData) }
  map.getSource('geojson-source').setData(geojsonData)
}

export function destroy (featureId) {
  console.log('Deleting feature ' + featureId)
  geojsonData.features = geojsonData.features.filter(feature => feature.id !== featureId)
  if (draw) { draw.set(geojsonData) }
  map.getSource('geojson-source').setData(geojsonData)
}

export function setBackgroundMapLayer (mapName = mapProperties.base_map) {
  console.log('Loading base map ' + mapName)
  map.setStyle(basemaps[mapName],
  // adding this so that 'style.load' gets triggered (https://github.com/maplibre/maplibre-gl-js/issues/2587)
    { diff: false })
}
