import { map, flash } from 'map/map'
import { resetInteractions } from 'map/interactions'
import { backgroundTiles } from 'map/layers/background_maps'
import { selectInteraction } from 'map/interactions/readonly'
import { mapChannel } from 'channels/map_channel'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export let mapProperties
export let backgroundMapLayer

const mapDefaults = {
  projection: 'EPSG:3857'
}

export function initializeMapProperties () {
  mapProperties = { ...mapDefaults, ...window.gon.map_properties }
  console.log('map properties: ' + JSON.stringify(mapProperties))

  const layerPreviews = document.querySelectorAll('.layer-preview')
  layerPreviews.forEach(layerPreview => {
    layerPreview.addEventListener('click', function () {
      mapProperties.base_map = event.target.dataset.layer
      loadBackgroundMapLayer()
      mapChannel.send_message('update_map', { base_map: mapProperties.base_map })
      flash('Base map updated', 'success')
      layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
      event.target.classList.add('active')
    })
  })

  const mapCenter = document.querySelector('#set-map-center')
  mapCenter.addEventListener('click', function (event) {
    event.preventDefault()
    const center = ol.proj.toLonLat(map.getView().getCenter())
    const zoom = map.getView().getZoom()
    const name = document.querySelector('#map-name').value
    document.querySelector('#map-center').innerHTML = center
    document.querySelector('#map-zoom').innerHTML = zoom
    mapProperties.center = center
    mapProperties.zoom = zoom
    mapChannel.send_message('update_map', { center, zoom, name })
    flash('Map center/zoom updated', 'success')
    return false
  })

  // When the user clicks anywhere outside of the modal, close it
  document.getElementById('map').onclick = function (event) {
    const modal = document.querySelector('#map-modal')
    if (event.target !== modal && modal.style.display === 'block') {
      resetInteractions()
      map.addInteraction(selectInteraction)
    }
  }
}

export function loadBackgroundMapLayer () {
  console.log("Loading base map '" + mapProperties.base_map + "'")
  map.removeLayer(backgroundMapLayer)
  backgroundMapLayer = backgroundTiles()[mapProperties.base_map]
  map.getLayers().insertAt(0, backgroundMapLayer)
}
