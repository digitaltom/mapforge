import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, mapProperties, setBackgroundMapLayer, geojsonData, upsert } from 'maplibre/map'
import { initLayersModal, resetControls } from 'maplibre/controls'

// eslint expects variables to get imported, but we load the full lib in header
const toGeoJSON = window.toGeoJSON
const turf = window.turf

export default class extends Controller {
  update_feature () {
    document.querySelector('#edit-modal .error').innerHTML = ''
    const id = document.querySelector('#edit-modal').getAttribute('data-feature-id')
    const geojsonFeature = geojsonData.features.find(f => f.id === id)
    try {
      geojsonFeature.properties = JSON.parse(document.querySelector('.feature-details-atts-edit textarea').value)
      map.getSource('geojson-source').setData(geojsonData)
      mapChannel.send_message('update_feature', geojsonFeature)
    } catch (error) {
      console.error('Error updating feature:', error.message)
      document.querySelector('#edit-modal .error').innerHTML = error.message
    }
  }

  update_basemap (event) {
    const layerPreviews = document.querySelectorAll('.layer-preview')
    mapProperties.base_map = event.target.dataset.layer
    // alternative to https://maplibre.org/maplibre-gl-js/docs/API/classes/TerrainControl/
    mapProperties.terrain = document.querySelector('#map-terrain').checked
    setBackgroundMapLayer(mapProperties.base_map)
    mapChannel.send_message('update_map', { base_map: mapProperties.base_map, terrain: mapProperties.terrain })
    layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
    event.target.classList.add('active')
  }

  update_mapdata (event) {
    event.preventDefault()
    const center = [map.getCenter().lng, map.getCenter().lat]
    const zoom = map.getZoom()
    const pitch = map.getPitch()
    const name = document.querySelector('#map-name').value
    const terrain = document.querySelector('#map-terrain').checked
    document.querySelector('#map-center').innerHTML = center
    document.querySelector('#map-zoom').innerHTML = zoom
    document.querySelector('#map-pitch').innerHTML = pitch
    mapProperties.center = center
    mapProperties.zoom = zoom
    mapProperties.pitch = pitch
    mapProperties.terrain = terrain
    mapChannel.send_message('update_map', { center, zoom, pitch, name, terrain })
    return false
  }

  upload () {
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = function (event) {
        const content = event.target.result
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(content, 'application/xml')
        let geoJSON

        // https://github.com/mapbox/togeojson?tab=readme-ov-file#api
        if (file.type === 'application/gpx+xml') {
          geoJSON = toGeoJSON.gpx(xmlDoc)
        } else if (file.type === 'application/vnd.google-earth.kml+xml') {
          geoJSON = toGeoJSON.kml(xmlDoc)
        }
        console.log(geoJSON)

        geoJSON.features.forEach(feature => {
          feature.id = Math.random().toString(36).substring(2, 18)
          upsert(feature)
          mapChannel.send_message('new_feature', feature)
        })
        initLayersModal()
      }

      if (file.type === 'application/gpx+xml' ||
        file.type === 'application/vnd.google-earth.kml+xml') {
        reader.readAsText(file)
      } else {
        console.log('Unsupported file type: ' + file.type)
      }
    }
  }

  flyto () {
    const id = this.element.getAttribute('data-feature-id')
    const feature = geojsonData.features.find(f => f.id === id)
    // Calculate the centroid
    const centroid = turf.centroid(feature)
    console.log('Fly to: ' + feature.id + ' ' + centroid.geometry.coordinates)
    resetControls()
    map.flyTo({
      center: centroid.geometry.coordinates,
      speed: 0.8,
      curve: 1,
      essential: true
    })
  }
}
