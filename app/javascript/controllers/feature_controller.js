import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, geojsonData } from 'maplibre/map'

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
}
