import { map, mapProperties, geojsonData } from 'maplibre/map'
import * as functions from 'helpers/functions'
import { draw } from 'maplibre/edit'
import { resetHighlightedFeature } from 'maplibre/feature'

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
      const modal = document.querySelector('#settings-modal')
      if (modal.classList.contains('show')) {
        resetControls()
      } else {
        resetControls()
        if (draw) { resetEditControls() }
        initSettingsModal()
        e.target.closest('button').classList.add('active')
        modal.classList.add('show')
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
      const modal = document.querySelector('#share-modal')
      if (modal.classList.contains('show')) {
        resetControls()
      } else {
        resetControls()
        if (draw) { resetEditControls() }
        e.target.closest('button').classList.add('active')
        modal.classList.add('show')
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
      const modal = document.querySelector('#layers-modal')
      if (modal.classList.contains('show')) {
        resetControls()
      } else {
        resetControls()
        if (draw) { resetEditControls() }
        initLayersModal()
        e.target.closest('button').classList.add('active')
        modal.classList.add('show')
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
  functions.e('#settings-modal', e => {
    if (mapProperties.name) { e.dataset.settingsMapNameValue = mapProperties.name }
    e.dataset.settingsBaseMapValue = mapProperties.base_map
    e.dataset.settingsMapTerrainValue = mapProperties.terrain
    e.dataset.settingsDefaultPitchValue = Math.round(mapProperties.pitch)
    e.dataset.settingsDefaultZoomValue = parseFloat(mapProperties.zoom || mapProperties.default_zoom).toFixed(2)
    e.dataset.settingsDefaultBearingValue = Math.round(mapProperties.bearing)
    if (mapProperties.center) {
      e.dataset.settingsDefaultCenterValue = JSON.stringify(mapProperties.center)
    }
    e.dataset.settingsDefaultAutoCenterValue = JSON.stringify(mapProperties.default_center)
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
  // reset cursor
  functions.e('.maplibregl-canvas', e => { e.classList.remove('cursor-crosshair') })
  // reset ctrl buttons
  functions.e('.maplibregl-ctrl-btn', e => { e.classList.remove('active') })
  // reset active modals
  functions.e('.map-modal', e => { e.classList.remove('show') })
  // collapse menu
  functions.e('#burger-menu-toggle', e => { e.checked = false })
}

function resetEditControls () {
  draw.changeMode('simple_select')
  map.fire('draw.modechange')
}
