import { mapProperties, geojsonData } from 'maplibre/map'
import * as functions from 'helpers/functions'
import { editPopup } from 'maplibre/edit'
import { resetHighlightedFeature } from 'maplibre/styles'

export class ControlGroup {
  constructor (controls) {
    this.controls = controls
  }

  onAdd (map) {
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

    // Add each control to the container
    this.controls.forEach(control => {
      this.container.appendChild(control.onAdd(map))
    })

    return this.container
  }

  onRemove (map) {
    this.controls.forEach(control => {
      control.onRemove(map)
    })
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }
}

export class MapSettingsControl {
  constructor (options) {
    this._container = document.createElement('div')
    this._container.innerHTML = '<button class="maplibregl-ctrl-btn maplibregl-ctrl-map" type="button" title="Map settings" aria-label="Map settings" aria-pressed="false"><b><i class="bi bi-globe-americas"></i></b></button>'
    this._container.onclick = function (e) {
      if (document.querySelector('#settings-modal').style.display === 'block') {
        resetControls()
      } else {
        resetControls()
        initSettingsModal()
        e.target.closest('button').classList.add('active')
        document.querySelector('#settings-modal').style.display = 'block'
      }
    }
  }

  onAdd (map) {
    map.getCanvas().appendChild(this._container)
    return this._container
  }

  onRemove () {
    if (this._container.parentNode) {
      this._container.parentNode.removeChild(this._container)
    }
  }
}

export class MapShareControl {
  constructor (options) {
    this._container = document.createElement('div')
    this._container.innerHTML = '<button class="maplibregl-ctrl-btn maplibregl-ctrl-share" type="button" title="Map settings" aria-label="Map settings" aria-pressed="false"><b><i class="bi bi-share-fill"></i></b></button>'
    this._container.onclick = function (e) {
      if (document.querySelector('#share-modal').style.display === 'block') {
        resetControls()
      } else {
        resetControls()
        e.target.closest('button').classList.add('active')
        document.querySelector('#share-modal').style.display = 'block'
      }
    }
  }

  onAdd (map) {
    map.getCanvas().appendChild(this._container)
    return this._container
  }

  onRemove () {
    if (this._container.parentNode) {
      this._container.parentNode.removeChild(this._container)
    }
  }
}

export class MapLayersControl {
  constructor (options) {
    this._container = document.createElement('div')
    this._container.innerHTML = '<button class="maplibregl-ctrl-btn maplibregl-ctrl-layers" ' +
      'type="button" title="Map settings" aria-label="Map settings" aria-pressed="false">' +
      '<b><i class="bi bi-stack"></i></b></button>'
    this._container.onclick = function (e) {
      if (document.querySelector('#layers-modal').style.display === 'block') {
        resetControls()
      } else {
        resetControls()
        initLayersModal()
        e.target.closest('button').classList.add('active')
        document.querySelector('#layers-modal').style.display = 'block'
      }
    }
  }

  onAdd (map) {
    map.getCanvas().appendChild(this._container)
    return this._container
  }

  onRemove () {
    if (this._container.parentNode) {
      this._container.parentNode.removeChild(this._container)
    }
  }
}

// initialize settings modal with default map values from mapProperties
export function initSettingsModal () {
  functions.e('#map-name', e => { e.value = mapProperties.name })
  functions.e('#map-terrain', e => { e.checked = mapProperties.terrain })
  functions.e('.layer-preview', e => { e.classList.remove('active') })
  functions.e('img[data-base-map="' + mapProperties.base_map + '"]', e => { e.classList.add('active') })
  functions.e('#settings-modal', e => {
    e.dataset.settingsDefaultPitchValue = Math.round(mapProperties.pitch)
    e.dataset.settingsDefaultZoomValue = parseFloat(mapProperties.zoom || mapProperties.default_zoom).toFixed(2)
    e.dataset.settingsDefaultBearingValue = Math.round(mapProperties.bearing)
    if (mapProperties.center) {
      e.dataset.settingsDefaultCenterValue = JSON.stringify(mapProperties.center)
    }
  })
}

// create the list of layers + features
export function initLayersModal () {
  functions.e('#default-layer .layer-elements', e => {
    e.innerHTML = ''
    geojsonData.features.forEach(feature => {
      const listItem = document.createElement('li')
      listItem.classList.add('layer-feature-item')
      listItem.textContent = `${feature.geometry.type}: ` +
          (feature.properties.name || feature.properties.title || feature.id)
      const link = document.createElement('a')
      link.setAttribute('href', '#')
      link.setAttribute('onclick', 'return false;')
      listItem.appendChild(link)
      const icon = document.createElement('i')
      icon.classList.add('bi')
      icon.classList.add('bi-arrow-right-circle')
      icon.setAttribute('data-feature-id', feature.id)
      icon.setAttribute('data-controller', 'layers')
      icon.setAttribute('data-action', 'click->layers#flyto')
      link.appendChild(icon)
      e.appendChild(listItem)
    })
  })
}

export function resetControls () {
  resetHighlightedFeature()
  // reset ctrl buttons
  functions.e('.maplibregl-ctrl-btn', e => { e.classList.remove('active') })
  // reset active modals
  functions.e('.map-modal', e => { e.style.display = 'none' })
  // collapse menu
  functions.e('#burger-menu-toggle', e => { e.checked = false })
  // reset edit buttons
  if (editPopup) { editPopup.remove() }
}
