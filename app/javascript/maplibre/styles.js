import { map } from 'maplibre/map'
import * as f from 'helpers/functions'

export const viewStyleNames = [
  'polygon-layer',
  'polygon-layer-extrusion',
  'line-layer-outline',
  'line-layer',
  'points-border-layer',
  'points-layer',
  'symbols-layer',
  'text-layer'
]

export function initializeViewStyles () {
  viewStyleNames.forEach(styleName => {
    map.addLayer(styles[styleName])
  })
  map.on('styleimagemissing', loadImage)
  f.e('.map', e => { e.setAttribute("data-loaded", "true") })
}

// loading images from 'marker-image-url' attributes
export async function loadImage (e) {
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
}

// https://maplibre.org/maplibre-style-spec/layers/
// Expressions: https://maplibre.org/maplibre-style-spec/expressions/
// layout is fixed, paint flexible

export const styles = {
  'polygon-layer': {
    id: 'polygon-layer',
    type: 'fill',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'Polygon'],
      ['!=', 'active', 'true']],
    paint: {
      'fill-color': ['coalesce',
        ['get', 'fill'],
        ['get', 'user_fill'],
        'rgb(10, 135, 10)'],
      'fill-opacity':
          ['to-number', ['coalesce',
            ['get', 'fill-opacity'],
            ['get', 'user_fill-opacity'],
            0.5]]
    }
  },
  'polygon-layer-active': {
    id: 'polygon-layer-active',
    type: 'fill',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'Polygon'],
      ['==', 'active', 'true']],
    paint: {
      'fill-color': ['coalesce',
        ['get', 'fill'],
        ['get', 'user_fill'],
        'rgb(10, 135, 10)'],
      'fill-opacity':
            ['to-number', ['coalesce',
              ['get', 'fill-opacity'],
              ['get', 'user_fill-opacity'],
              0.8]]
    }
  },
  'polygon-layer-extrusion': {
    id: 'polygon-layer-extrusion',
    type: 'fill-extrusion',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'Polygon']],
    paint: {
      'fill-extrusion-color': ['coalesce',
        ['get', 'fill-extrusion-color'],
        ['get', 'user_fill-extrusion-color'],
        ['get', 'fill'],
        ['get', 'user_fill'],
        'rgb(10, 135, 10)'],
      'fill-extrusion-height': ['coalesce',
        ['get', 'fill-extrusion-height'],
        ['get', 'user_fill-extrusion-height']],
      'fill-extrusion-base': ['coalesce',
        ['get', 'fill-extrusion-base'],
        ['get', 'user_fill-extrusion-base']],
      // opacity does not support data expressions!?!
      'fill-extrusion-opacity': 0.4
    }
  },
  'line-layer-outline': {
    id: 'line-layer-outline',
    type: 'line',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'LineString', 'Polygon']],
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    // Draw prefixes properties with '_user'
    paint: {
      'line-color': 'white',
      'line-width': ['+', 2,
        ['to-number', ['coalesce',
          ['get', 'stroke-width'],
          ['get', 'user_stroke-width'],
          3]]],
      'line-opacity': ['to-number', ['coalesce', ['get', 'stroke-opacity'], ['get', 'user_stroke-opacity'], 1]]
    }
  },
  'line-layer': {
    id: 'line-layer',
    type: 'line',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'LineString', 'Polygon']],
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    // Draw prefixes properties with '_user'
    paint: {
      'line-color': ['coalesce', ['get', 'stroke'], ['get', 'user_stroke'], 'green'],
      'line-width': ['to-number', ['coalesce',
        ['get', 'stroke-width'],
        ['get', 'user_stroke-width'],
        3]],
      'line-opacity': ['to-number', ['coalesce', ['get', 'stroke-opacity'], ['get', 'user_stroke-opacity'], 1]]
    }
  },
  'points-border-layer': {
    id: 'points-border-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'active', 'true'],
      ['!has', 'marker-symbol'],
      ['!has', 'marker-image-url'],
      ['!has', 'user_marker-symbol'],
      ['!has', 'user_marker-image-url']],
    paint: {
      'circle-radius': [
        'match',
        ['coalesce', ['get', 'user_stroke'], ['get', 'stroke']],
        'transparent', 0,
        [
          'match',
          ['coalesce', ['get', 'user_marker-size'], ['get', 'marker-size']],
          'large', 15,
          8 // Default circle-radius
        ]],
      'circle-color': ['coalesce', ['get', 'user_stroke'], ['get', 'stroke'], '#ffffff']
    }
  },
  'points-layer': {
    id: 'points-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'active', 'true'],
      ['!has', 'marker-symbol'],
      ['!has', 'marker-image-url'],
      ['!has', 'user_marker-symbol'],
      ['!has', 'user_marker-image-url']],
    paint: {
      'circle-radius': [
        'match',
        ['coalesce', ['get', 'user_marker-color'], ['get', 'marker-color']],
        'transparent', 0, // If marker-color is 'transparent', set circle-radius to 0
        [
          'match',
          ['coalesce', ['get', 'user_marker-size'], ['get', 'marker-size']],
          'large', 12,
          6
        ]],
      'circle-color': ['coalesce', ['get', 'user_marker-color'], ['get', 'marker-color'], 'rgb(10, 135, 10)']
    }
  },
  // support symbols on all feature types
  'symbols-layer': {
    id: 'symbols-layer',
    type: 'symbol',
    source: 'geojson-source',
    filter: ['!=', 'active', 'true'],
    // minzoom: 15, // TODO: only static values possible right now
    layout: {
      'icon-image': ['coalesce',
        ['get', 'marker-image-url'],
        // replace marker-symbol value with path to emoji png
        ['case',
          ['has', 'marker-symbol'],
          ['concat', '/emojis/noto/', ['get', 'marker-symbol'], '.png'],
          '']
      ],
      'icon-size': [
        'match',
        ['get', 'marker-size'],
        'small', 0.25,
        'medium', 0.35,
        'large', 0.5,
        0.35],
      'icon-overlap': 'always',
      'icon-ignore-placement': true
    }
  },
  'text-layer': {
    id: 'text-layer',
    type: 'symbol',
    source: 'geojson-source',
    filter: ['has', 'label'],
    layout: {
      'text-field': ['coalesce', ['get', 'label'], ['get', 'room']],
      'text-size': 16,
      // must be available via glyphs: https://docs.maptiler.com/gl-style-specification/glyphs/
      // Emojis are not in the character range: https://github.com/maplibre/maplibre-gl-js/issues/2307
      // 'text-font': ['coalesce', ['get', 'title-font'], ['Open Sans Regular,Arial Unicode MS Regular']], // Ensure the font supports emojis
      'text-font': ['system-ui', 'sans-serif'],
      // if there is a symbol, move the text next to it
      'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      // if there is a symbol, offset the text below it
      'text-radial-offset': [
        'match',
        ['to-string', ['has', 'marker-symbol']],
        'true', 1.2,
        0
      ],
      'text-justify': 'auto'
    },
    paint: {
      'text-color': ['coalesce', ['get', 'label-color'], '#fff'],
      'text-halo-color': ['coalesce', ['get', 'label-shadow'], '#444'],
      'text-halo-width': 1
    }
  }
}
