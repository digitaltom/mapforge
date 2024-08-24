import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { resetControls } from 'maplibre/controls'
import * as functions from 'helpers/functions'
import { map, mapProperties, setBackgroundMapLayer } from 'maplibre/map'

export default class extends Controller {
  // https://stimulus.hotwired.dev/reference/values
  static values = {
    mapName: String,
    mapTerrain: Boolean,
    baseMap: String,
    defaultPitch: String,
    currentPitch: String,
    defaultZoom: String,
    currentZoom: String,
    defaultBearing: String,
    currentBearing: String,
    defaultCenter: Array,
    defaultAutoCenter: Array,
    currentCenter: Array
  }

  mapNameValueChanged (value, previousValue) {
    console.log('mapNameValueChanged(): ' + value)
    document.querySelector('#map-name').value = value
  }

  mapTerrainValueChanged (value, previousValue) {
    console.log('mapTerrainValueChanged(): ' + value)
    document.querySelector('#map-terrain').checked = value
  }

  baseMapValueChanged (value, previousValue) {
    console.log('baseMapValueChanged(): ' + value)
    functions.e('.layer-preview', e => { e.classList.remove('active') })
    functions.e('img[data-base-map="' + value + '"]', e => { e.classList.add('active') })
  }

  defaultPitchValueChanged (value, previousValue) {
    console.log('defaultPitchValueChanged(): ' + value)
    document.querySelector('#map-pitch').innerHTML = value
  }

  currentPitchValueChanged (value, previousValue) {
    console.log('currentPitchValueChanged(): ' + value)
    document.querySelector('#map-pitch-current').innerHTML = value
  }

  defaultZoomValueChanged (value, previousValue) {
    console.log('defaultZoomValueChanged(): ' + value)
    document.querySelector('#map-zoom').innerHTML = value
  }

  currentZoomValueChanged (value, previousValue) {
    console.log('currentZoomValueChanged(): ' + value)
    document.querySelector('#map-zoom-current').innerHTML = value
  }

  defaultBearingValueChanged (value, previousValue) {
    console.log('defaultBearingValueChanged(): ' + value)
    document.querySelector('#map-bearing').innerHTML = value
  }

  currentBearingValueChanged (value, previousValue) {
    console.log('currentBearingValueChanged(): ' + value)
    document.querySelector('#map-bearing-current').innerHTML = value
  }

  defaultCenterValueChanged (value, previousValue) {
    console.log('defaultCenterValueChanged(): "' + value + '"')
    if (value.length !== 0) {
      value = value.map(coord => parseFloat(coord.toFixed(4)))
    }
    document.querySelector('#map-center').innerHTML = value
  }

  defaultAutoCenterValueChanged (value, previousValue) {
    console.log('defaultAutoCenterValueChanged(): "' + value + '"')
    if (value.length !== 0 && !window.gon.map_properties.center) {
      value = value.map(coord => parseFloat(coord.toFixed(4)))
      document.querySelector('#map-center').innerHTML = `${value} (auto)`
    }
  }

  currentCenterValueChanged (value, previousValue) {
    console.log('currentCenterValueChanged(): ' + value)
    value = value.map(coord => parseFloat(coord.toFixed(4)))
    document.querySelector('#map-center-current').innerHTML = value
  }

  // alternative to https://maplibre.org/maplibre-gl-js/docs/API/classes/TerrainControl/
  updateTerrain (event) {
    this.mapTerrainValue = event.target.checked
    mapProperties.terrain = this.mapTerrainValue
    setBackgroundMapLayer()
    mapChannel.send_message('update_map', { terrain: mapProperties.terrain })
  }

  updateBaseMap (event) {
    this.baseMapValue = event.target.dataset.baseMap
    mapProperties.base_map = this.baseMapValue
    setBackgroundMapLayer()
    mapChannel.send_message('update_map', { base_map: mapProperties.base_map })
  }

  updateName (event) {
    event.preventDefault()
    const name = document.querySelector('#map-name').value
    mapProperties.name = name
    mapChannel.send_message('update_map', { name })
  }

  updateDefaultView (event) {
    event.preventDefault()
    const center = [map.getCenter().lng, map.getCenter().lat]
    const zoom = map.getZoom()
    const pitch = map.getPitch()
    const bearing = map.getBearing()
    mapProperties.center = center
    mapProperties.zoom = zoom
    mapProperties.pitch = pitch
    mapProperties.bearing = bearing
    mapChannel.send_message('update_map', { center, zoom, pitch, bearing })
  }

  close () {
    resetControls()
  }
}
