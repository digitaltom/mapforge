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
    style: 'https://api.maptiler.com/maps/streets/style.json?key=' + window.gon.map_keys.maptiler,
    center: mapProperties.center,
    zoom: mapProperties.zoom,
    pitch: 45,
    interactive: (window.gon.map_mode !== 'static')
  })
  map.addControl(new maplibregl.NavigationControl())

  map.on('load', function () {
    // After images are loaded, add the GeoJSON source and layer
    map.addSource('geojson-source', {
      type: 'geojson',
      data: '/maps/' + window.gon.map_id + '/features'
    })

    // https://maplibre.org/maplibre-style-spec/layers/
    // layout is fixed, paint flexible
    map.addLayer({
      id: 'polygon-layer',
      type: 'fill',
      source: 'geojson-source',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': ['coalesce', ['get', 'fill'], 'rgb(10, 135, 10)'],
        'fill-opacity': ['to-number', ['coalesce', ['get', 'fill-opacity'], 0.5]]
      }
    })

    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'geojson-source',
      filter: ['in', '$type', 'LineString', 'Polygon'],
      layout: {
          'line-join': 'round',
          'line-cap': 'round'
      },
      paint: {
        'line-color': ['coalesce', ['get', 'stroke'], 'rgb(10, 135, 10)'],
        'line-width': ['to-number', ['coalesce', ['get', 'stroke-width'], 5]]
      }
    })

    map.addLayer({
      id: 'points-layer',
      type: 'circle',
      source: 'geojson-source',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': ['coalesce', ['get', 'marker-color'], 'rgb(10, 135, 10)']
      }
    })

    map.addLayer({
      id: 'symbols-layer',
      type: 'symbol',
      source: 'geojson-source',
      filter: ['==', '$type', 'Point'],
      layout: {
        'icon-image': ['get', 'marker-icon'], // Use the 'icon' property from the GeoJSON properties
        'icon-size': 0.75,
        'icon-keep-upright': true,
        'icon-allow-overlap': true
      }
    })

    map.addLayer({
      id: 'text-layer',
      type: 'symbol',
      source: 'geojson-source',
      layout: {
        // "text-field": ["format",
        //     "", { "font-scale": 1.2 },
        //     "", { "font-scale": 0.8 }
        // ],
        'text-field': ['coalesce', ['get', 'title'], ['get', 'label']], // fallback to label
        'text-size': 24,
        // must be available via glyphs: https://docs.maptiler.com/gl-style-specification/glyphs/
        // Emojis seem not to be in the character range: https://github.com/maplibre/maplibre-gl-js/issues/2307
        'text-font': ['Noto Color Emoji'], //['Arial Unicode MS Bold', 'Open Sans Bold'], // Ensure the font supports emojis
        'text-anchor': 'top'
      },
      paint: {
        "text-color": '#123',
      }
    })
  })

  // loading images from 'marker-icon' attributes
  map.on('styleimagemissing', async function (e) {
    const imageUrl = e.id
    const response = await map.loadImage(imageUrl)
    if (!map.hasImage(imageUrl)) {
      // console.log('adding ' + imageUrl + ' to map')
      map.addImage(imageUrl, response.data)
    }
  })
}
