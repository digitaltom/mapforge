import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, mapProperties, setBackgroundMapLayer } from 'maplibre/map'

export default class extends Controller {
  // https://stimulus.hotwired.dev/reference/values
  static values = {
    defaultPitch: String,
    currentPitch: String,
    defaultZoom: String,
    currentZoom: String,
    defaultBearing: String,
    currentBearing: String,
    defaultCenter: Array,
    currentCenter: Array
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
    if (value.length === 0) { value = window.gon.map_properties.default_center + '(auto)' }
    document.querySelector('#map-center').innerHTML = value
  }

  currentCenterValueChanged (value, previousValue) {
    console.log('currentCenterValueChanged(): ' + value)
    document.querySelector('#map-center-current').innerHTML = value
  }

  // alternative to https://maplibre.org/maplibre-gl-js/docs/API/classes/TerrainControl/
  update_terrain (event) {
    const terrain = document.querySelector('#map-terrain').checked
    mapProperties.terrain = terrain
    setBackgroundMapLayer()
    mapChannel.send_message('update_map', { terrain })
  }

  update_basemap (event) {
    const layerPreviews = document.querySelectorAll('.layer-preview')
    mapProperties.base_map = event.target.dataset.baseMap
    setBackgroundMapLayer()
    mapChannel.send_message('update_map', { base_map: mapProperties.base_map, terrain: mapProperties.terrain })
    layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
    event.target.classList.add('active')
  }

  use_current_view (event) {
    event.preventDefault()
    const center = [map.getCenter().lng, map.getCenter().lat]
    const zoom = map.getZoom()
    const pitch = map.getPitch()
    const bearing = map.getBearing()
    const name = document.querySelector('#map-name').value
    mapProperties.name = name
    mapProperties.center = center
    mapProperties.zoom = zoom
    mapProperties.pitch = pitch
    mapProperties.bearing = bearing
    mapChannel.send_message('update_map', { center, zoom, pitch, bearing, name })
  }
}
