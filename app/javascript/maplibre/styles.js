import { map } from 'maplibre/map'
import * as f from 'helpers/functions'
import {
  highlightedFeatureId, stickyFeatureHighlight,
  resetHighlightedFeature, highlightFeature
} from 'maplibre/feature'

export const viewStyleNames = [
  'polygon-layer',
  'polygon-layer-extrusion',
  'line-layer-outline',
  'line-layer',
  'line-layer-hit',
  'points-border-layer',
  'points-layer',
  'points-hit-layer',
  'symbols-layer',
  'text-layer'
]

export function initializeViewStyles () {
  viewStyleNames.forEach(styleName => {
    map.addLayer(styles[styleName])
  })
  // click is needed to select on mobile and for sticky highlight
  map.on('click', viewStyleNames, function (e) {
    if (!e.features?.length || window.gon.map_mode === 'static') { return }
    highlightFeature(e.features[0], true)
  })

  // highlight features on hover
  map.on('mousemove', (e) => {
    if (!(stickyFeatureHighlight && highlightedFeatureId)) {
      resetHighlightedFeature()
      const features = map.queryRenderedFeatures(e.point)
      if (!features?.length || window.gon.map_mode === 'static') { return }
      if (features[0].source === 'geojson-source') {
        highlightFeature(features[0])
      } else {
        // console.log(features[0])
      }
    }
  })

  map.on('styleimagemissing', loadImage)
  f.e('#maplibre-map', e => { e.setAttribute('data-loaded', true) })
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

// shared styles
// Mapbox.Draw layers prefix user properties with '_user'

export const featureColor = 'rgb(10, 135, 10)' // green, #0A870A
const featureOutlineColor = 'white'

const fillColor = ['coalesce',
  ['get', 'fill'], ['get', 'user_fill'], featureColor]
const fillOpacity = ['*', 0.7, ['to-number', ['coalesce',
  ['get', 'fill-opacity'], ['get', 'user_fill-opacity'], 1]]]
const fillOpacityActive = ['*', 0.7, fillOpacity]

const lineColor = ['coalesce', ['get', 'stroke'], ['get', 'user_stroke'], featureColor]
export const defaultLineWidth = 4
const lineWidth = ['to-number', ['coalesce',
  ['get', 'stroke-width'], ['get', 'user_stroke-width'], defaultLineWidth]]
const lineWidthActive = ['+', 2, lineWidth]
const lineOpacity = ['to-number', ['coalesce',
  ['get', 'stroke-opacity'], ['get', 'user_stroke-opacity'], 0.8]]
const lineOpacityActive = 1
const outlineColor = featureOutlineColor
const outlineWidth = ['+', 4, lineWidth]
const outlineWidthActive = ['+', 3, outlineWidth]

const pointColor = ['coalesce', ['get', 'user_marker-color'], ['get', 'marker-color'],
  ['case',
    ['any', ['has', 'user_marker-symbol'], ['has', 'marker-symbol']],
    'white', featureColor]]
const pointSizeMin = ['to-number', ['coalesce',
  ['get', 'user_marker-size'], ['get', 'marker-size'],
  ['case',
    ['any', ['has', 'user_marker-symbol'], ['has', 'marker-symbol']],
    6, 2]]]
export const pointSizeMax = ['to-number', ['coalesce',
  ['get', 'user_marker-size'], ['get', 'marker-size'],
  ['case',
    ['any', ['has', 'user_marker-symbol'], ['has', 'marker-symbol']],
    16, 6]]]
export const pointSize = [
  'interpolate',
  ['linear'],
  ['zoom'],
  8, [
    'case',
    ['boolean', ['feature-state', 'active'], false],
    ['+', 1, pointSizeMin],
    pointSizeMin
  ], // At zoom level 8, the point size is min
  13, [
    'case',
    ['boolean', ['feature-state', 'active'], false],
    ['+', 1, pointSizeMax],
    pointSizeMax
  ] // At zoom level 13, the point size is max
]

export const pointOutlineSize = ['to-number', ['coalesce', ['get', 'user_stroke-width'], ['get', 'stroke-width'], 2]]
export const pointOutlineSizeActive = ['+', 1, pointOutlineSize]
const pointOutlineColor = ['coalesce', ['get', 'user_stroke'], ['get', 'stroke'], featureOutlineColor]
const pointOpacity = 0.7
const pointOpacityActive = 0.9

// factor of the original icon size (72x72)
// in case of icon url, we don't know the size
// default: 1/6 = 12px (2 * default radius pointSizeMax)
const iconSizeFactor = ['/', pointSizeMax, 6]
const iconSize = ['*', 1 / 8, iconSizeFactor]
// const iconSizeActive = ['*', 1.1, iconSize] // icon-size is not a paint property
const labelSize = ['to-number', ['coalesce', ['get', 'user_label-size'], ['get', 'label-size'], 16]]

// font must be available via glyphs:
// openmaptiles: https://github.com/openmaptiles/fonts/tree/gh-pages
// maptiler: https://docs.maptiler.com/gl-style-specification/glyphs/
// versatiles: https://github.com/versatiles-org/versatiles-fonts/tree/main/fonts
// Emojis are not in the character range: https://github.com/maplibre/maplibre-gl-js/issues/2307
const labelFont = ['Klokantech Noto Sans Bold']

export const styles = {
  'polygon-layer': {
    id: 'polygon-layer',
    type: 'fill',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'Polygon']],
    paint: {
      'fill-color': fillColor,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        fillOpacityActive,
        fillOpacity
      ]
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
        featureColor],
      'fill-extrusion-height': ['coalesce',
        ['get', 'fill-extrusion-height'],
        ['get', 'user_fill-extrusion-height']],
      'fill-extrusion-base': ['coalesce',
        ['get', 'fill-extrusion-base'],
        ['get', 'user_fill-extrusion-base']],
      // opacity does not support data expressions!?!
      'fill-extrusion-opacity': 0.9
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
    paint: {
      'line-color': outlineColor,
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        outlineWidthActive,
        outlineWidth
      ],
      'line-opacity': lineOpacity
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
      'line-color': lineColor,
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        lineWidthActive,
        lineWidth
      ],
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        lineOpacityActive,
        lineOpacity
      ]
    }
  },
  'line-layer-hit': {
    id: 'line-layer-hit',
    type: 'line',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'LineString']],
    paint: {
      'line-width': ['+', 15, outlineWidth],
      'line-opacity': 0
    }
  },
  'points-border-layer': {
    id: 'points-border-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'active', 'true'],
      ['!=', 'meta', 'midpoint'],
      ['!=', 'meta', 'vertex']
    ],
    paint: {
      'circle-pitch-scale': 'map', // points get bigger when camera is closer
      'circle-radius': pointSize,
      'circle-opacity': 0,
      'circle-stroke-color': pointOutlineColor,
      'circle-blur': 0.1,
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        pointOutlineSizeActive,
        pointOutlineSize
      ],
      'circle-stroke-opacity': pointOpacity + 0.2
    }
  },
  'points-layer': {
    id: 'points-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'active', 'true'],
      ['!=', 'meta', 'midpoint'],
      ['!=', 'meta', 'vertex']
    ],
    paint: {
      'circle-pitch-scale': 'map', // points get bigger when camera is closer
      'circle-radius': pointSize,
      'circle-color': pointColor,
      'circle-opacity': [
        'match',
        ['coalesce', ['get', 'user_marker-color'], ['get', 'marker-color']],
        'transparent', 0, // If marker-color is 'transparent', set circle-radius to 0
        [
          'case',
          ['boolean', ['feature-state', 'active'], false],
          pointOpacityActive,
          pointOpacity
        ]],
      'circle-blur': 0.1
    }
  },
  'points-hit-layer': {
    id: 'points-hit-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'active', 'true']
    ],
    paint: {
      'circle-radius': ['+', 5, pointSizeMax],
      'circle-opacity': 0
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
        // replacing marker-symbol value with path to emoji png
        ['case',
          ['has', 'marker-symbol'],
          ['concat', '/emojis/noto/', ['get', 'marker-symbol'], '.png'],
          '']
      ],
      'icon-size': iconSize, // cannot scale on hover/zoom because it's not a paint property
      'icon-overlap': 'always', // https://maplibre.org/maplibre-style-spec/layers/#icon-overlap
      'icon-ignore-placement': true // other symbols can be visible even if they collide with the icon
    },
    paint: {
      // cannot set circle-stroke-* in the symbol layer :-(
    }
  },
  'text-layer': {
    id: 'text-layer',
    type: 'symbol',
    source: 'geojson-source',
    filter: ['has', 'label'],
    layout: {
      'text-field': ['coalesce', ['get', 'label'], ['get', 'room']],
      'text-size': labelSize,
      'text-font': labelFont,
      // arrange text to avoid collision
      'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
      // distance the text from the element depending on the type
      'text-radial-offset': [
        'match',
        ['to-string', ['has', 'marker-symbol']],
        'true', 1.4,
        0.6
      ],
      'text-justify': 'auto',
      'text-ignore-placement': false // hide on collision
    },
    paint: {
      'text-color': ['coalesce', ['get', 'user_label-color'], ['get', 'label-color'], '#000'],
      'text-halo-color': ['coalesce', ['get', 'user_label-shadow'], ['get', 'label-shadow'], '#fff'],
      'text-halo-width': 1
    }
  }
}
