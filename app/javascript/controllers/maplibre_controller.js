import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, mapProperties, setBackgroundMapLayer } from 'maplibre/map'

export default class extends Controller {
  update_basemap (event) {
    const layerPreviews = document.querySelectorAll('.layer-preview')
    mapProperties.base_map = event.target.dataset.layer
    setBackgroundMapLayer(mapProperties.base_map)
    mapChannel.send_message('update_map', { base_map: mapProperties.base_map })
    layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
    event.target.classList.add('active')
  }

  update_mapdata (event) {
    event.preventDefault()
    const center = [map.getCenter().lng, map.getCenter().lat]
    const zoom = map.getZoom()
    const pitch = map.getPitch()
    const name = document.querySelector('#map-name').value
    document.querySelector('#map-center').innerHTML = center
    document.querySelector('#map-zoom').innerHTML = zoom
    document.querySelector('#map-pitch').innerHTML = pitch
    mapProperties.center = center
    mapProperties.zoom = zoom
    mapProperties.pitch = pitch
    mapChannel.send_message('update_map', { center, zoom, pitch, name })
    return false
  }
}
