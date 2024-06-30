import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, geojsonData, upsert } from 'maplibre/map'
import { initLayersModal, resetControls } from 'maplibre/controls'

// eslint expects variables to get imported, but we load the full lib in header
const toGeoJSON = window.toGeoJSON
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
      speed: 0.4,
      curve: 3,
      essential: true
    })
  }
}
