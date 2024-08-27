import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { geojsonData, redrawGeojson } from 'maplibre/map'
import { handleDelete, draw } from 'maplibre/edit'
import { status } from 'helpers/status'
import { showFeatureDetails } from 'maplibre/modals'
import Pell from 'pell'
import Turndown from 'turndown'
import { marked } from 'marked'

let pellEditor
const turndownService = new Turndown({ headingStyle: 'atx' })

export default class extends Controller {
  // https://stimulus.hotwired.dev/reference/values
  static values = {
    featureId: String
  }

  delete_feature () {
    const feature = this.getFeature()
    if (confirm('Really delete this element?')) {
      handleDelete({ features: [feature] })
    }
  }

  toggle_edit_feature (event) {
    document.querySelector('#edit-button-edit').classList.remove('active')
    document.querySelector('#edit-button-raw').classList.remove('active')
    if (document.querySelector('#feature-edit-raw').classList.contains('hidden') && event.currentTarget.dataset.raw) {
      console.log('show_feature_edit_raw')
      document.querySelector('#edit-button-raw').classList.add('active')
      document.querySelector('#feature-details-modal').classList.add('modal-pull-up')
      document.querySelector('#feature-details-body').classList.add('hidden')
      this.show_feature_edit_raw()
    } else if (document.querySelector('#feature-edit-ui').classList.contains('hidden') && event.currentTarget.dataset.ui) {
      console.log('show_feature_edit_ui')
      document.querySelector('#edit-button-raw').classList.remove('hidden')
      document.querySelector('#edit-button-edit').classList.add('active')
      document.querySelector('#feature-details-body').classList.add('hidden')
      this.show_feature_edit_ui()
    } else {
      document.querySelector('#edit-button-raw').classList.add('hidden')
      showFeatureDetails(this.getFeature())
    }
    document.querySelector('#feature-edit-raw .error').innerHTML = ''
  }

  show_feature_edit_ui () {
    const feature = this.getFeature()
    document.querySelector('#feature-edit-ui').classList.remove('hidden')
    document.querySelector('#feature-edit-raw').classList.add('hidden')
    // https://github.com/jaredreich/pell
    pellEditor ||= Pell.init({
      element: document.getElementById('pell-editor'),
      onChange: html => console.log(html),
      actions: ['bold', 'italic', 'underline', 'strikethrough',
        'heading1', 'heading2', 'paragraph', 'quote', 'olist', 'ulist',
        'code', 'line', 'link']
    })
    pellEditor.content.innerHTML = marked(feature.properties.desc || '')
    document.querySelector('#point-size').value = feature.properties['marker-size'] || 6
    document.querySelector('#line-width').value = feature.properties['stroke-width'] || 2
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
    document.querySelector('#feature-edit-raw .error').innerHTML = ''
    try {
      feature.properties = JSON.parse(document.querySelector('#feature-edit-raw textarea').value)
      redrawGeojson()
      mapChannel.send_message('update_feature', feature)
    } catch (error) {
      console.error('Error updating feature:', error.message)
      status('Error updating feature', 'error')
      document.querySelector('#feature-edit-raw .error').innerHTML = error.message
    }
  }

  updateDesc () {
    const feature = this.getFeature()
    try {
      feature.properties.desc = turndownService.turndown(pellEditor.content.innerHTML)
      redrawGeojson()
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
    // draw layer feature properties aren't getting updated by draw.set()
    draw.setFeatureProperty(this.featureIdValue, 'marker-size', size)
    redrawGeojson()
    // send shallow copy of feature to avoid changes during send
    mapChannel.send_message('update_feature', { ...feature })
  }

  updateLineWidth () {
    const feature = this.getFeature()
    const size = document.querySelector('#line-width').value
    feature.properties['stroke-width'] = size
    // draw layer feature properties aren't getting updated by draw.set()
    draw.setFeatureProperty(this.featureIdValue, 'stroke-width', size)
    redrawGeojson()
    // send shallow copy of feature to avoid changes during send
    mapChannel.send_message('update_feature', { ...feature })
  }

  toggleModalSize (e) {
    const modal = e.target.closest('.map-modal')
    modal.classList.toggle('modal-pull-down')
    modal.classList.toggle('modal-pull-up')
  }

  getFeature () {
    const id = this.featureIdValue
    return geojsonData.features.find(f => f.id === id)
  }
}
