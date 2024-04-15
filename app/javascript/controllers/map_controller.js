import { Controller } from '@hotwired/stimulus'
import { flash, setBackgroundMapLayer } from 'ol/map'
import { mapChannel } from 'channels/map_channel'
import { mapProperties } from 'ol/properties'

export default class extends Controller {
  update (event) {
    const layerPreviews = document.querySelectorAll('.layer-preview')
    mapProperties.base_map = event.target.dataset.layer
    setBackgroundMapLayer()
    mapChannel.send_message('update_map', { base_map: mapProperties.base_map })
    flash('Base map updated', 'success')
    layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
    event.target.classList.add('active')
  }
}
