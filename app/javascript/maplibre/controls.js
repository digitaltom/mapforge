import { mapProperties } from 'ol/properties'

export class MapSettingsControl {
  constructor (options) {
    this._container = document.createElement('div')
    this._container.innerHTML = '<button class="maplibregl-ctrl-map" type="button" title="Map settings" aria-label="Map settings" aria-pressed="false"><b><i class="bi bi-map-fill"></i></b></button>'
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    this._container.onclick = function (event) {
      if (document.querySelector('#map-modal').style.display === 'block') {
        document.querySelector('#map-modal').style.display = 'none'
      } else {
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
    // super();
    this._container = document.createElement('div')
    this._container.innerHTML = '<button class="maplibregl-ctrl-map" type="button" title="Map settings" aria-label="Map settings" aria-pressed="false"><b><i class="bi bi-share-fill"></i></b></button>'

    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    this._container.onclick = function (event) {
      if (document.querySelector('#share-modal').style.display === 'block') {
        document.querySelector('#share-modal').style.display = 'none'
      } else {
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
