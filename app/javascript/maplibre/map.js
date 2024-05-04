import { mapProperties } from 'ol/properties'
import { basemaps } from 'maplibre/basemaps'
import { draw } from 'maplibre/edit'
import { initializeStyles } from 'maplibre/styles'
import { initializeEditStyles } from 'maplibre/edit_styles'

// eslint expects variables to get imported, but we load the full lib in header
const maplibregl = window.maplibregl
const maptilersdk = window.maptilersdk

export let map
export let geojsonData

const terrain = false
export function initializeMap (divId = 'maplibre-map') {
  maptilersdk.config.apiKey = window.gon.map_keys.maptiler
  map = new maplibregl.Map({
    container: divId,
    style: basemaps.satelliteStreets,
    center: mapProperties.center,
    zoom: mapProperties.zoom,
    pitch: 45,
    interactive: (window.gon.map_mode !== 'static')
  })

  map.on('load', function () {
    if (terrain) { addTerrain() }

    // https://maplibre.org/maplibre-style-spec/sources/#geojson
    map.addSource('geojson-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: false
    })

    fetch('/maps/' + window.gon.map_id + '/features')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        console.log('GeoJSON data:', data)
        geojsonData = data
        console.log('loaded ' + geojsonData.features.length + ' features from ' + '/maps/' + window.gon.map_id + '/features')
        map.getSource('geojson-source').setData(geojsonData)

        // in rw mode, the feature layer is managed by 'draw', not maplibre layers
        if (window.gon.map_mode === 'rw') {
          draw.set(geojsonData)
          initializeEditStyles()
        } else {
          initializeStyles()
        }
      })
      .catch(error => {
        console.error('Failed to fetch GeoJSON:', error)
      })
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

export function initializeReadonlyInteractions () {
  map.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    })
  )
}

export function update (updatedFeature) {
  console.log('Updating feature ' + updatedFeature.id)
  const feature = geojsonData.features.find(feature => feature.id === updatedFeature.id)
  if (!feature) {
    geojsonData.features.push(updatedFeature)
  } else {
    feature.geometry = updatedFeature.geometry
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
