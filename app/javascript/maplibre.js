// import { hexToRgb } from 'helpers/functions'
import { mapProperties, initializeMapProperties } from 'ol/properties'

// eslint expects variables to get imported, but we load the full lib in header
const maplibregl = window.maplibregl;
// const maptilersdk = window.maptilersdk;

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('maplibre-map')) {
      init()
    }
  })
})

async function init () {
  initializeMapProperties()

  // maptilersdk.config.apiKey = window.gon.map_keys.maptiler
  // const map = new maptilersdk.Map({
  //   container: 'maplibre-map',
  //   style: maptilersdk.MapStyle.STREETS,
  //   center: [11.087296431880343, 49.4286744309569],
  //   zoom: 14,
  // })

  const map = new maplibregl.Map({
    container: 'maplibre-map',
    style: 'https://api.maptiler.com/maps/dataviz/style.json?key=' + window.gon.map_keys.maptiler,
    center: mapProperties.center,
    zoom: mapProperties.zoom,
    pitch: 45
  })

  map.on('load', function () {
    map.addSource('geojson-source', {
      type: 'geojson',
      data: '/maps/' + window.gon.map_id + '/features'
    })

    map.addLayer({
      id: 'geojson-layer',
      type: 'fill', // This can be 'line', 'circle', etc., depending on your GeoJSON geometry
      source: 'geojson-source',
      paint: {
        'fill-color': '#888888',
        'fill-opacity': 0.4
      }
    })

    map.addLayer({
      id: 'points-layer',
      type: 'symbol',
      source: 'geojson-source',
      layout: {
        'icon-image': ['get', 'marker-icon'], // Use the 'icon' property from the GeoJSON properties
        'icon-size': 1.5
      }
    })

    map.addLayer({
      id: 'text-layer',
      type: 'symbol',
      source: 'geojson-source',
      layout: {
        'text-field': ['get', 'label'], // Use the 'title' property of the GeoJSON feature
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-radial-offset': 0.5,
        'text-justify': 'auto'
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    })
  })
}
