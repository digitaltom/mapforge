import { basemaps } from 'maplibre/basemaps'
import { draw } from 'maplibre/edit'
import { initializeViewStyles } from 'maplibre/styles'
import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header
const maplibregl = window.maplibregl
const maptilersdk = window.maptilersdk

export let map
export let geojsonData //= { type: 'FeatureCollection', features: [] }
export let mapProperties
const terrain = false

// workflow of event based map loading:
//
// * initializeMap() - set map object
// * setup map callbacks (initializeViewMode(), initializeEditMode())
// * setBackgroundMapLayer() -> 'style.load' event
//   -> loadGeoJsonData() -> 'geojson.load' event
//      -> triggers callbacks for setting geojson/draw style layers
export function initializeMapProperties () {
  mapProperties = window.gon.map_properties
  console.log('map properties: ' + JSON.stringify(mapProperties))
}

export function initializeMap (divId = 'maplibre-map') {
  initializeMapProperties()
  maptilersdk.config.apiKey = window.gon.map_keys.maptiler
  map = new maplibregl.Map({
    container: divId,
    center: mapProperties.center,
    zoom: mapProperties.zoom,
    pitch: mapProperties.pitch,
    interactive: (window.gon.map_mode !== 'static')
  })
  // for console debugging
  window.map = map

  // after basemap style is ready/changed, load geojson layer
  map.on('style.load', () => {
    loadGeoJsonData()
  })

  map.on('load', function () {
    if (terrain) { addTerrain() }
  })
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
      // the features in the rendered layer don't have ids right now, because
      // mapforge feature ids are not numeric.
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
    exaggeration: 1.2
  })
}

export function initializeControls () {
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

export function initializeViewMode () {
  initializeControls()

  map.on('geojson.load', function (e) {
    initializeViewStyles()
  })

  map.on('click', 'points-layer', function (e) {
    if (e.features.length === 1) {
      const clickedFeature = e.features[0]
      console.log(clickedFeature.id)
      console.log('Clicked feature:', clickedFeature)
    }
  })
}

export function update (updatedFeature) {
  console.log('Updating feature ' + updatedFeature.id)
  const feature = geojsonData.features.find(feature => feature.id === updatedFeature.id)
  if (!feature) {
    geojsonData.features.push(updatedFeature)
  } else {
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
  map.setStyle(basemaps[mapName],
  // adding this so that 'style.load' gets triggered (https://github.com/maplibre/maplibre-gl-js/issues/2587)
    { diff: false })
}

function animatePoint (feature, end, duration = 300) {
  const starttime = performance.now()
  const start = feature.geometry.coordinates
  console.log('Animating point from: ' + start + ' to ' + end)

  function animate (timestamp) {
    let progress = (timestamp - starttime) / duration
    if (progress > 1) { progress = 1 }
    const newCoordinates = [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress
    ]
    feature.geometry.coordinates = newCoordinates
    map.getSource('geojson-source').setData(geojsonData)
    if (draw) { draw.set(geojsonData) }

    if (progress < 1) { requestAnimationFrame(animate) }
  }
  requestAnimationFrame(animate)
}
