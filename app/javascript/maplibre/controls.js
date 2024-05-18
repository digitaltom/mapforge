import { mapProperties } from 'maplibre/map'
import * as functions from 'helpers/functions'
import { editPopup } from 'maplibre/edit'

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
    this._container.onclick = function (event) {
      if (document.querySelector('#map-modal').style.display === 'block') {
        resetControls()
      } else {
        resetControls()
        document.querySelector('.maplibregl-ctrl-map').classList.add('active')
        document.querySelector('#map-modal').style.display = 'block'
        document.querySelector('#map-name').value = mapProperties.name
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
    this._container.onclick = function (event) {
      if (document.querySelector('#share-modal').style.display === 'block') {
        resetControls()
      } else {
        resetControls()
        document.querySelector('.maplibregl-ctrl-share').classList.add('active')
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
    this._container.innerHTML = '<button class="maplibregl-ctrl-btn maplibregl-ctrl-share" ' +
      'type="button" title="Map settings" aria-label="Map settings" aria-pressed="false">' +
      '<b><i class="bi bi-stack"></i></b></button>'
    this._container.onclick = function (event) {
      if (document.querySelector('#share-modal').style.display === 'block') {
        resetControls()
      } else {
        resetControls()
        document.querySelector('.maplibregl-ctrl-share').classList.add('active')
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

export function resetControls () {
  // reset map modal
  functions.e('.maplibregl-ctrl-map', e => { e.classList.remove('active') })
  functions.e('#map-modal', e => { e.style.display = 'none' })
  // reset share modal
  functions.e('.maplibregl-ctrl-share', e => { e.classList.remove('active') })
  functions.e('#share-modal', e => { e.style.display = 'none' })
  // edit modal
  functions.e('#edit-feature', e => { e.classList.add('hidden') })
  // reset edit buttons
  if (editPopup) { editPopup.remove() }
}
