import { map } from 'maplibre/map'

export function initializeStyles () {
  map.addLayer(styles['polygon-layer'])
  map.addLayer(styles['line-layer'])
  map.addLayer(styles['points-layer'])
  map.addLayer(styles['symbols-layer'])
  map.addLayer(styles['text-layer'])

  // loading images from 'marker-icon' attributes
  map.on('styleimagemissing', async function (e) {
    const imageUrl = e.id
    const response = await map.loadImage(imageUrl)
    if (response) {
      if (!map.hasImage(imageUrl)) {
        // console.log('adding ' + imageUrl + ' to map')
        map.addImage(imageUrl, response.data)
      }
    } else {
      console.warn(imageUrl + ' not found')
    }
  })
}

// https://maplibre.org/maplibre-style-spec/layers/
// Expressions: https://maplibre.org/maplibre-style-spec/expressions/
// layout is fixed, paint flexible
export const styles = {
  'polygon-layer': {
    id: 'polygon-layer',
    type: 'fill',
    source: 'geojson-source',
    filter: ['==', '$type', 'Polygon'],
    paint: {
      'fill-color': ['coalesce', ['get', 'fill'], 'rgb(10, 135, 10)'],
      'fill-opacity': ['to-number', ['coalesce', ['get', 'fill-opacity'], 0.5]]
    }
  },

  'line-layer': {
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
      'line-width': ['to-number', ['coalesce', ['get', 'stroke-width'], 4]]
    }
  },

  'active-points-layer': {
    id: 'edit-points-layer',
    type: 'circle',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['==', 'active', 'true']],
    paint: {
      'circle-radius': 6,
      'circle-color': ['coalesce', ['get', 'marker-color'], 'rgb(10, 135, 10)']
    }
  },

  'points-layer': {
    id: 'points-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['==', '$type', 'Point'],
    paint: {
      'circle-radius': 6,
      'circle-color': ['coalesce', ['get', 'marker-color'], 'rgb(10, 135, 10)']
    }
  },
  // support symbols on all feature types
  'symbols-layer': {
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
  },
  'text-layer': {
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
  }
}
