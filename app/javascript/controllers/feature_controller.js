import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { geojsonData, redrawGeojson } from 'maplibre/map'
import { handleDelete, draw } from 'maplibre/edit'
import { defaultLineWidth } from 'maplibre/styles'
import { status } from 'helpers/status'
import { showFeatureDetails } from 'maplibre/modals'
import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header
const EasyMDE = window.EasyMDE

let easyMDE

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
    event.stopPropagation()
  }

  show_feature_edit_ui () {
    this.pullUpModal()
    const feature = this.getFeature()
    document.querySelector('#feature-edit-ui').classList.remove('hidden')
    document.querySelector('#feature-edit-raw').classList.add('hidden')

    // switch feature title to input form
    document.querySelector('#feature-title-input').classList.remove('hidden')
    document.querySelector('#feature-title').classList.add('hidden')
    document.querySelector('#feature-title-input input').value = feature.properties.title || null

    document.querySelector('#feature-desc').classList.add('hidden')
    document.querySelector('#button-add-desc').classList.remove('hidden')
    document.querySelector('#feature-label').classList.add('hidden')
    document.querySelector('#button-add-label').classList.remove('hidden')
    if (feature.properties.label) { this.show_add_label() }
    if (feature.properties.desc) { this.show_add_desc() }

    functions.e('.edit-point, .edit-line, .edit-polygon', e => { e.classList.add('hidden') })
    if (feature.geometry.type === 'Point') {
      functions.e('#feature-edit-ui .edit-point', e => { e.classList.remove('hidden') })
      const size = feature.properties['marker-size'] || 6
      document.querySelector('#point-size').value = size
      document.querySelector('#point-size-val').innerHTML = '(' + size + ')'
    } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
      functions.e('#feature-edit-ui .edit-line', e => { e.classList.remove('hidden') })
      const size = feature.properties['stroke-width'] || defaultLineWidth
      document.querySelector('#line-width').value = size
      document.querySelector('#line-width-val').innerHTML = '(' + size + ')'
    } else if (feature.geometry.type === 'Polygon') {
      functions.e('#feature-edit-ui .edit-polygon', e => { e.classList.remove('hidden') })
      document.querySelector('#line-width').value = feature.properties['stroke-width'] || 2
    }
  }

  show_feature_edit_raw () {
    this.pullUpModal()
    const feature = this.getFeature()
    document.querySelector('#feature-edit-ui').classList.add('hidden')
    document.querySelector('#feature-edit-raw').classList.remove('hidden')
    document.querySelector('#feature-edit-raw textarea')
      .value = JSON.stringify(feature.properties, undefined, 2)
  }

  show_add_label () {
    document.querySelector('#button-add-label').classList.add('hidden')
    document.querySelector('#feature-label').classList.remove('hidden')
    document.querySelector('#feature-label input').value = this.getFeature().properties.label || null
  }

  show_add_desc () {
    document.querySelector('#button-add-desc').classList.add('hidden')
    document.querySelector('#feature-desc').classList.remove('hidden')
    // https://github.com/Ionaru/easy-markdown-editor
    if (easyMDE) { easyMDE.toTextArea() }
    document.querySelector('#feature-desc-input').value = this.getFeature().properties.desc || ''
    easyMDE = new EasyMDE({
      element: document.getElementById('feature-desc-input'),
      placeholder: 'Add a description',
      hideIcons: ['quote', 'ordered-list', 'fullscreen', 'side-by-side', 'preview', 'guide'],
      maxHeight: '6em',
      spellChecker: false,
      status: [{
        className: 'autosave',
        onUpdate: functions.debounce(() => { this.updateDesc() }, 2000)
      }]
    })
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

  updateTitle () {
    const feature = this.getFeature()
    const title = document.querySelector('#feature-title-input input').value
    feature.properties.title = title
    document.querySelector('#feature-title').textContent = title
    this.saveFeature()
  }

  updateLabel () {
    const feature = this.getFeature()
    const label = document.querySelector('#feature-label input').value
    feature.properties.label = label
    draw.setFeatureProperty(this.featureIdValue, 'label', label)
    redrawGeojson()
    this.saveFeature()
  }

  updateDesc () {
    const feature = this.getFeature()
    try {
      if (feature.properties.desc !== easyMDE.value()) {
        feature.properties.desc = easyMDE.value()
        mapChannel.send_message('update_feature', feature)
      }
    } catch (error) {
      console.error('Error updating feature:', error.message)
      status('Error updating feature', 'error')
    }
  }

  // called as preview on slider change
  updatePointSize () {
    const feature = this.getFeature()
    const size = document.querySelector('#point-size').value
    document.querySelector('#point-size-val').innerHTML = '(' + size + ')'
    feature.properties['marker-size'] = size
    // draw layer feature properties aren't getting updated by draw.set()
    draw.setFeatureProperty(this.featureIdValue, 'marker-size', size)
    redrawGeojson()
  }

  // called as preview on slider change
  updateLineWidth () {
    const feature = this.getFeature()
    const size = document.querySelector('#line-width').value
    document.querySelector('#line-width-val').textContent = '(' + size + ')'
    feature.properties['stroke-width'] = size
    // draw layer feature properties aren't getting updated by draw.set()
    draw.setFeatureProperty(this.featureIdValue, 'stroke-width', size)
    redrawGeojson()
  }

  saveFeature () {
    const feature = this.getFeature()
    // send shallow copy of feature to avoid changes during send
    mapChannel.send_message('update_feature', { ...feature })
  }

  toggleModalSize (e) {
    console.log('toggleModalSize')
    const modal = e.target.closest('.map-modal')
    modal.classList.toggle('modal-pull-down')
    modal.classList.toggle('modal-pull-up')
    e.stopPropagation()
  }

  pullUpModal () {
    const modal = document.querySelector('#feature-details-modal')
    modal.classList.remove('modal-pull-down')
    modal.classList.add('modal-pull-up')
  }

  getFeature () {
    const id = this.featureIdValue
    return geojsonData.features.find(f => f.id === id)
  }
}
