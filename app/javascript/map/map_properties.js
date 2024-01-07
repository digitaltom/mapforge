import { map, flash } from 'map/map'
import { selectInteraction, resetInteractions } from 'map/interactions'
import { mapChannel } from 'channels/map_channel'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export let mapProperties
export let rasterLayer

const mapDefaults = {
  projection: 'EPSG:3857'
}

const satelliteTiles = new ol.source.XYZ({
  attributions: ['Powered by Esri',
    'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
  attributionsCollapsible: true,
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  maxZoom: 19
})
const satelliteStreetTiles = new ol.source.XYZ({
  url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGlnaXRhbHRvbW0iLCJhIjoiY2wwZHNkc3ZhMGMzMTNjcHN0MXk3bDlzOCJ9.JT98YXrb7_FlaVSroXCq7Q',
  tileSize: 512
})
const osmTiles = new ol.source.OSM()
const streetTiles = new ol.source.XYZ({
  url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGlnaXRhbHRvbW0iLCJhIjoiY2wwZHNkc3ZhMGMzMTNjcHN0MXk3bDlzOCJ9.JT98YXrb7_FlaVSroXCq7Q'
})
// https://opentopomap.org/about#verwendung
const openTopoTiles = new ol.source.XYZ({
  url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
  attributions: ['Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)']
})
const esriTiles = new ol.source.XYZ({
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
})
const stamenToner = new ol.source.StadiaMaps({ layer: 'stamen_toner', retina: true })
const stamenWatercolor = new ol.source.StadiaMaps({ layer: 'stamen_watercolor', retina: true })

export const backgroundTiles = {
  satellite: satelliteTiles,
  satelliteStreets: satelliteStreetTiles,
  osm: osmTiles,
  streetTiles,
  esriTiles,
  stamenWatercolor,
  stamenToner,
  openTopoTiles
}

export function initializeMapProperties () {
  mapProperties = { ...mapDefaults, ...window.gon.map_properties }
  console.log('map properties: ' + JSON.stringify(mapProperties))
  rasterLayer = new ol.layer.Tile({ source: backgroundTiles[mapProperties.base_map] })

  const modal = document.querySelector('#map-modal')
  const layerPreviews = document.querySelectorAll('.layer-preview')
  layerPreviews.forEach(layerPreview => {
    layerPreview.addEventListener('click', function () {
      mapProperties.base_map = event.target.dataset.layer
      rasterLayer.setSource(backgroundTiles[mapProperties.base_map])
      mapChannel.send_message('update_map', { base_map: mapProperties.base_map })
      flash('Base map updated', 'success')
      layerPreviews.forEach(layerPreview => { layerPreview.classList.remove('active') })
      event.target.classList.add('active')
    })
  })

  const mapCenter = document.querySelector('#set-map-center')
  mapCenter.addEventListener('click', function (event) {
    event.preventDefault()
    const center = map.getView().getCenter()
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
    console.log(event.target)
    if (event.target !== modal && modal.style.display !== 'none') {
      resetInteractions()
      document.querySelector('.button-select').classList.add('active')
      map.addInteraction(selectInteraction)
    }
  }
}
