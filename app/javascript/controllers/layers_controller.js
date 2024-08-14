import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, geojsonData, upsert, mapProperties } from 'maplibre/map'
import { initLayersModal, resetControls } from 'maplibre/controls'
import { highlightFeature } from 'maplibre/styles'
import { status } from 'helpers/status'

// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

export default class extends Controller {
  upload () {
    const fileInput = document.getElementById('fileInput')
    const file = fileInput.files[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = function (event) {
        const content = event.target.result
        const parser = new DOMParser()
        let geoJSON

        // https://github.com/mapbox/togeojson?tab=readme-ov-file#api
        if (file.type === 'application/gpx+xml') {
          const xmlDoc = parser.parseFromString(content, 'application/xml')
          geoJSON = window.toGeoJSON.gpx(xmlDoc)
        } else if (file.type === 'application/vnd.google-earth.kml+xml') {
          const xmlDoc = parser.parseFromString(content, 'application/xml')
          geoJSON = window.toGeoJSON.kml(xmlDoc)
        } else if (file.type === 'application/geo+json') {
          geoJSON = JSON.parse(content)
        } else if (file.type === 'application/json') {
          // mapforge or geojson export file
          geoJSON = JSON.parse(content)
          if (geoJSON.layers) { geoJSON = geoJSON.layers[0] }
        }

        geoJSON.features.forEach(feature => {
          feature.id = Math.random().toString(36).substring(2, 18)
          feature.properties ||= {}
          upsert(feature)
          mapChannel.send_message('new_feature', feature)
        })

        const props = JSON.parse(content).properties
        if (props) {
          mapProperties.base_map = props.base_map
          mapProperties.center = props.center
          mapProperties.zoom = props.zoom
          mapProperties.pitch = props.pitch
          mapProperties.bearing = props.bearing
          mapProperties.name = props.name
          mapChannel.send_message('update_map', mapProperties)
        }

        status('File imported')
        initLayersModal()
      }

      if (file.type === 'application/gpx+xml' ||
        file.type === 'application/vnd.google-earth.kml+xml' ||
        file.type === 'application/geo+json' ||
        file.type === 'application/json') {
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
    map.once('moveend', function () { highlightFeature(feature, true) })
    map.flyTo({
      center: centroid.geometry.coordinates,
      duration: 1000,
      curve: 0.3,
      essential: true
    })
  }
}
