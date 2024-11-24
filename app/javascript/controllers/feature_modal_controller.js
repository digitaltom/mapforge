import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { geojsonData, updateGeojson } from 'maplibre/map'
import { defaultLineWidth } from 'maplibre/styles'
import { status } from 'helpers/status'
import { showFeatureDetails } from 'maplibre/modals'
import * as functions from 'helpers/functions'
import * as dom from 'helpers/dom'

let easyMDE

export default class extends Controller {
  // https://stimulus.hotwired.dev/reference/values
  static values = {
    featureId: String
  }

  toggle_edit_feature (event) {
    dom.showElements('#edit-button-edit', '#edit-button-raw')
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
    if (document.querySelector('#feature-details-modal').classList.contains('modal-pull-down')) {
      this.pullUpModal()
    }
    const feature = this.getFeature()
    dom.showElements(['#feature-edit-ui', '#feature-title-input', '#button-add-desc', '#button-add-label'])
    dom.hideElements(['#feature-edit-raw', '#feature-title', '#feature-desc', '#feature-label'])

    // init ui input elements
    document.querySelector('#feature-title-input input').value = feature.properties.title || null
    if (feature.properties.label) { this.show_add_label() }
    if (feature.properties.desc) { this.show_add_desc() }

    dom.hideElements(['.edit-point', '.edit-line', '.edit-polygon'])
    document.querySelector('#stroke-color').value = feature.properties.stroke || '#0A870A'
    document.querySelector('#fill-color').value = feature.properties.fill || '#0A870A'
    if (feature.geometry.type === 'Point') {
      dom.showElements(['#feature-edit-ui .edit-point'])
      const size = feature.properties['marker-size'] || 6
      document.querySelector('#point-size').value = size
      document.querySelector('#point-size-val').innerHTML = '(' + size + ')'
      document.querySelector('#fill-color').value = feature.properties['marker-color'] || '#0A870A'
      document.querySelector('#marker-symbol').value = feature.properties['marker-symbol'] || ''
    } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
      dom.showElements(['#feature-edit-ui .edit-line'])
      const size = feature.properties['stroke-width'] || defaultLineWidth
      document.querySelector('#line-width').value = size
      document.querySelector('#line-width-val').innerHTML = '(' + size + ')'
    } else if (feature.geometry.type === 'Polygon') {
      dom.showElements(['#feature-edit-ui .edit-polygon'])
      document.querySelector('#line-width').value = feature.properties['stroke-width'] || 2
      document.querySelector('#fill-color').value = feature.properties.fill || '#0A870A'
    }
  }

  show_feature_edit_raw () {
    if (document.querySelector('#feature-details-modal').classList.contains('modal-pull-down')) {
      this.pullUpModal()
    }
    const feature = this.getFeature()
    dom.hideElements(['#feature-edit-ui'])
    dom.showElements(['#feature-edit-raw'])
    document.querySelector('#feature-edit-raw textarea')
      .value = JSON.stringify(feature.properties, undefined, 2)
  }

  show_add_label () {
    dom.hideElements(['#button-add-label'])
    dom.showElements(['#feature-label'])
    document.querySelector('#feature-label input').value = this.getFeature().properties.label || null
  }

  show_add_desc () {
    dom.hideElements(['#button-add-desc'])
    dom.showElements(['#feature-desc'])
    // https://github.com/Ionaru/easy-markdown-editor
    if (easyMDE) { easyMDE.toTextArea() }
    document.querySelector('#feature-desc-input').value = this.getFeature().properties.desc || ''
    easyMDE = new window.EasyMDE({
      element: document.getElementById('feature-desc-input'),
      placeholder: 'Add a description text',
      hideIcons: ['quote', 'ordered-list', 'fullscreen', 'side-by-side', 'preview', 'guide'],
      maxHeight: '6em',
      spellChecker: false,
      status: [{
        className: 'autosave',
        onUpdate: () => { this.updateDesc() }
      }]
    })
  }

  updateDesc () {
    const feature = this.getFeature()
    try {
      if (easyMDE && feature.properties.desc !== easyMDE.value()) {
        feature.properties.desc = easyMDE.value()
        updateGeojson()
        functions.debounce(() => { this.saveFeature() }, 'desc', 2000)
      }
    } catch (error) {
      console.error('Error updating feature:', error.message)
      status('Error updating feature', 'error')
    }
  }

  saveFeature () {
    const feature = this.getFeature()
    status('Saving feature ' + feature.id)
    // send shallow copy of feature to avoid changes during send
    mapChannel.send_message('update_feature', { ...feature })
  }

  toggleModalSize (e) {
    console.log('toggleModalSize')
    const modal = e.target.closest('.map-modal')
    if (modal.classList.contains('modal-pull-up')) {
      modal.classList.add('modal-pull-down')
      modal.classList.remove('modal-pull-up')
    } else {
      modal.classList.remove('modal-pull-down')
      modal.classList.add('modal-pull-up')
    }
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