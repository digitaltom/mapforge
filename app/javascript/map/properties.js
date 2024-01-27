import { map, flash } from 'map/map'
import { resetInteractions } from 'map/interactions'
import { backgroundTiles } from 'map/layers/tile_maps'
import { selectInteraction } from 'map/interactions/readonly'
import { mapChannel } from 'channels/map_channel'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const olms = window.olms

export let mapProperties
export let backgroundTileLayer, backgroundVectorLayer

const mapDefaults = {
  projection: 'EPSG:3857'
}

export function initializeMapProperties () {
  mapProperties = { ...mapDefaults, ...window.gon.map_properties }
  console.log('map properties: ' + JSON.stringify(mapProperties))

  const modal = document.querySelector('#map-modal')
  const layerPreviews = document.querySelectorAll('.layer-preview')
  layerPreviews.forEach(layerPreview => {
    layerPreview.addEventListener('click', function () {
      mapProperties.base_map = event.target.dataset.layer
      loadBackgroundLayers()
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
    if (event.target !== modal && modal.style.display !== 'none') {
      resetInteractions()
      document.querySelector('.button-select').classList.add('active')
      map.addInteraction(selectInteraction)
    }
  }
}

export function loadBackgroundLayers () {
  console.log("Loading base map '" + mapProperties.base_map + "'")

  if (mapProperties.base_map === 'vector') {
    backgroundVectorLayer = new ol.layer.VectorTile({
      declutter: true
      // source: osmVector
    })
    olms.applyStyle(backgroundVectorLayer, 'https://api.maptiler.com/maps/basic-v2/style.json?key=' + window.gon.map_keys.maptiler)
    // olms.applyBackground(rasterLayer, "https://api.maptiler.com/maps/bright-v2/style.json?key" + keys.maptiler)
  } else {
    map.removeLayer(backgroundTileLayer)
    backgroundTileLayer = new ol.layer.Tile({ source: backgroundTiles()[mapProperties.base_map] })
    map.getLayers().insertAt(0, backgroundTileLayer)
  }
}
