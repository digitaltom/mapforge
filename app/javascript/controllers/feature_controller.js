import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, geojsonData } from 'maplibre/map'
import { handleDelete, draw } from 'maplibre/edit'
import { status } from 'helpers/status'
import { showFeatureDetails } from 'maplibre/modals'
import Pell from 'pell'
import Turndown from 'turndown'
import { marked } from 'marked'

let pellEditor
const turndownService = new Turndown({ headingStyle: 'atx' })

export default class extends Controller {
  delete_feature () {
    const feature = this.getFeature()
    if (confirm('Really delete this element?')) {
      handleDelete({ features: [feature] })
    }
  }

  toggle_edit_feature (event) {
    if (document.querySelector('#feature-edit-raw').classList.contains('hidden') && event.currentTarget.dataset.raw) {
      console.log('show_feature_edit_raw')
      document.querySelector('#feature-details-modal').classList.add('expanded')
      document.querySelector('#feature-details-body').classList.add('hidden')
      this.show_feature_edit_raw()
    } else if (document.querySelector('#feature-edit-ui').classList.contains('hidden') && event.currentTarget.dataset.ui) {
      console.log('show_feature_edit_ui')
      document.querySelector('#feature-details-modal').classList.add('expanded')
      document.querySelector('#feature-details-body').classList.add('hidden')
      this.show_feature_edit_ui()
    } else {
      showFeatureDetails(this.getFeature())
    }
    document.querySelector('#edit-feature .error').innerHTML = ''
  }

  show_feature_edit_ui () {
    const feature = this.getFeature()
    document.querySelector('#feature-edit-ui').classList.remove('hidden')
    document.querySelector('#feature-edit-raw').classList.add('hidden')
    pellEditor ||= Pell.init({
      element: document.getElementById('pell-editor'),
      onChange: html => console.log(html)
    })
    pellEditor.content.innerHTML = marked(feature.properties.desc || '')
  }

  show_feature_edit_raw () {
    const feature = this.getFeature()
    document.querySelector('#feature-edit-ui').classList.add('hidden')
    document.querySelector('#feature-edit-raw').classList.remove('hidden')
    document.querySelector('#feature-edit-raw textarea')
      .value = JSON.stringify(feature.properties, undefined, 2)
  }

  update_feature_raw () {
    const feature = this.getFeature()
    document.querySelector('#edit-feature .error').innerHTML = ''
    try {
      feature.properties = JSON.parse(document.querySelector('#feature-edit-raw textarea').value)
      map.getSource('geojson-source').setData(geojsonData)
      mapChannel.send_message('update_feature', feature)
    } catch (error) {
      console.error('Error updating feature:', error.message)
      status('Error updating feature', 'error')
      document.querySelector('#edit-feature .error').innerHTML = error.message
    }
  }

  update_feature_ui () {
    const feature = this.getFeature()
    try {
      feature.properties.desc = turndownService.turndown(pellEditor.content.innerHTML)
      map.getSource('geojson-source').setData(geojsonData)
      mapChannel.send_message('update_feature', feature)
    } catch (error) {
      console.error('Error updating feature:', error.message)
      status('Error updating feature', 'error')
    }
  }

  updatePointSize () {
    const feature = this.getFeature()
    const size = document.querySelector('#point-size').value
    feature.properties['marker-size'] = size
    map.getSource('geojson-source').setData(geojsonData)
    mapChannel.send_message('update_feature', feature)
    if (draw) {
      draw.changeMode('simple_select', { featureIds: [] })
      draw.changeMode('simple_select', { featureIds: [feature.id] })
    }
  }

  getFeature () {
    const id = document.querySelector('#feature-details-modal').getAttribute('data-feature-id')
    return geojsonData.features.find(f => f.id === id)
  }
}
