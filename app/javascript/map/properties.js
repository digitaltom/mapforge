import { map, flash } from 'map/map'
import { mapChannel } from 'channels/map_channel'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

const mapDefaults = {
  projection: 'EPSG:3857'
}

export let mapProperties

export function initializeMapProperties () {
  mapProperties = { ...mapDefaults, ...window.gon.map_properties }
  console.log('map properties: ' + JSON.stringify(mapProperties))
}

export function initializeMapModal () {
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
}
