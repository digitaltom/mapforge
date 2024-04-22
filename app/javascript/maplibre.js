// import { hexToRgb } from 'helpers/functions'
import { mapProperties, initializeMapProperties } from 'ol/properties'
import { basemaps } from 'maplibre/basemaps'

// eslint expects variables to get imported, but we load the full lib in header
const maplibregl = window.maplibregl
const MapboxDraw = window.MapboxDraw
// const maptilersdk = window.maptilersdk;

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

let geojsonSource

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
    style: basemaps.satelliteStreets,
    center: mapProperties.center,
    zoom: mapProperties.zoom,
    pitch: 45,
    interactive: (window.gon.map_mode !== 'static')
  })
  map.addControl(new maplibregl.NavigationControl())

  const draw = new MapboxDraw({})
  map.addControl(draw, 'top-left')

  map.on('draw.create', handleCreate)
  // map.on('draw.update', handleUpdate)
  // map.on('draw.delete', handleDelete)

  function handleCreate (e) {
    const source = map.getSource('geojson-source')
    const feature = e.features[0] // Assuming one feature is created at a time
    console.log(feature)
    geojsonSource.features.push(feature)
    source.setData(geojsonSource)
  }

  map.on('load', function () {
    // https://maplibre.org/maplibre-style-spec/sources/#geojson
    map.addSource('geojson-source', {
      type: 'geojson',
      // data: '/maps/' + window.gon.map_id + '/features',
      data: { type: 'FeatureCollection', features: [] },
      cluster: false
    })

    fetch('/maps/' + window.gon.map_id + '/features')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        return response.json()
      })
      .then(data => {
        console.log('GeoJSON data:', data)
        geojsonSource = data
        console.log('loaded ' + geojsonSource.features.length + ' features from ' + '/maps/' + window.gon.map_id + '/features')
        map.getSource('geojson-source').setData(geojsonSource)
        draw.set(geojsonSource)
      })
      .catch(error => {
        console.error('Failed to fetch GeoJSON:', error)
      })

    // map.on('sourcedata', function(e) {
    //     if (e.sourceId === 'geojson-source' && map.isSourceLoaded('geojson-source')) {
    //       //console.log(e.sourceId + 'loaded')
    //       var features = map.querySourceFeatures('geojson-source')
    //       console.log(features)
    //       draw.set({
    //           type: 'FeatureCollection',
    //           features: features
    //       })
    //     }
    // });

    // https://maplibre.org/maplibre-style-spec/layers/
    // Expressions: https://maplibre.org/maplibre-style-spec/expressions/
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

    // support symbols on all feature types
    map.addLayer({
      id: 'symbols-layer',
      type: 'symbol',
      source: 'geojson-source',
      layout: {
        'icon-image': ['coalesce',
          ['get', 'marker-icon'],
          // replace marker-symbol value with path to emoji png
          ['case',
            ['has', 'marker-symbol'],
            ['concat', '/emojis/noto/', ['get', 'marker-symbol'], '.png'],
            '']
        ],
        'icon-size': 0.5,
        'icon-keep-upright': true,
        'icon-allow-overlap': false
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
        'text-field': ['get', 'title'],
        'text-size': 24,
        // must be available via glyphs: https://docs.maptiler.com/gl-style-specification/glyphs/
        // Emojis seem not to be in the character range: https://github.com/maplibre/maplibre-gl-js/issues/2307
        // 'text-font': ['Noto Color Emoji'], // ['Arial Unicode MS Bold', 'Open Sans Bold'], // Ensure the font supports emojis
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#123'
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
