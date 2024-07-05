import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, geojsonData } from 'maplibre/map'
import { handleDelete } from 'maplibre/edit'
import { status } from 'helpers/status'

export default class extends Controller {
  delete_feature () {
    const feature = this.getFeature()
    handleDelete({ features: [feature] })
  }

  toggle_edit_feature () {
    const feature = this.getFeature()
    if (document.querySelector('#edit-feature').classList.contains('hidden')) {
      document.querySelector('#feature-details-modal').classList.add('expanded')
      document.querySelector('#edit-feature').classList.remove('hidden')
      document.querySelector('#feature-details-body').classList.add('hidden')
      document.querySelector('.feature-details-atts-edit textarea').value = JSON.stringify(feature.properties)
    } else {
      document.querySelector('#feature-details-modal').classList.remove('expanded')
      document.querySelector('#edit-feature').classList.add('hidden')
      document.querySelector('#feature-details-body').classList.remove('hidden')
    }
    document.querySelector('#edit-feature .error').innerHTML = ''
  }

  update_feature () {
    const feature = this.getFeature()
    document.querySelector('#edit-feature .error').innerHTML = ''
    try {
      feature.properties = JSON.parse(document.querySelector('.feature-details-atts-edit textarea').value)
      map.getSource('geojson-source').setData(geojsonData)
      mapChannel.send_message('update_feature', feature)
    } catch (error) {
      console.error('Error updating feature:', error.message)
      status('Error updating feature', 'error')
      document.querySelector('#edit-feature .error').innerHTML = error.message
    }
  }

  getFeature () {
    const id = document.querySelector('#feature-details-modal').getAttribute('data-feature-id')
    return geojsonData.features.find(f => f.id === id)
  }
}
