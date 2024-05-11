import { Controller } from '@hotwired/stimulus'
import { mapChannel } from 'channels/map_channel'
import { map, mapProperties, setBackgroundMapLayer, geojsonData } from 'maplibre/map'

export default class extends Controller {
  update_feature () {
    const id = document.querySelector('#edit-feature').getAttribute('data-feature-id')
    const geojsonFeature = geojsonData.features.find(f => f.id === id)
    geojsonFeature.properties = JSON.parse(document.querySelector('.feature-details-atts-edit textarea').value)

    map.getSource('geojson-source').setData(geojsonData)
    mapChannel.send_message('update_feature', geojsonFeature)
  }

  update_basemap (event) {
    const layerPreviews = document.querySelectorAll('.layer-preview')
    mapProperties.base_map = event.target.dataset.layer
    // alternative to https://maplibre.org/maplibre-gl-js/docs/API/classes/TerrainControl/
    mapProperties.terrain = document.querySelector('#map-terrain').checked
    setBackgroundMapLayer(mapProperties.base_map)
    mapChannel.send_message('update_map', { base_map: mapProperties.base_map, terrain: mapProperties.terrain })
    layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
    event.target.classList.add('active')
  }

  update_mapdata (event) {
    event.preventDefault()
    const center = [map.getCenter().lng, map.getCenter().lat]
    const zoom = map.getZoom()
    const pitch = map.getPitch()
    const name = document.querySelector('#map-name').value
    const terrain = document.querySelector('#map-terrain').checked
    document.querySelector('#map-center').innerHTML = center
    document.querySelector('#map-zoom').innerHTML = zoom
    document.querySelector('#map-pitch').innerHTML = pitch
    mapProperties.center = center
    mapProperties.zoom = zoom
    mapProperties.pitch = pitch
    mapProperties.terrain = terrain
    mapChannel.send_message('update_map', { center, zoom, pitch, name, terrain })
    return false
  }
}
