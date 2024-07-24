import { map, geojsonData } from 'maplibre/map'
import * as f from 'helpers/functions'
import { showFeatureDetails } from 'maplibre/modals'
import { draw } from 'maplibre/edit'

let highlightedFeatureId
export const viewStyleNames = [
  'polygon-layer',
  'polygon-layer-extrusion',
  'line-layer-outline',
  'line-layer',
  'line-layer-hit',
  'points-layer',
  'points-hit-layer',
  'symbols-layer',
  'text-layer'
]

export function resetHighlightedFeature (source = 'geojson-source') {
  if (highlightedFeatureId) {
    map.setFeatureState({ source, id: highlightedFeatureId },
      { active: false })
    highlightedFeatureId = null
  }
  // reset active modals
  f.e('.map-modal', e => { e.style.display = 'none' })
}

export function highlightFeature (feature, source = 'geojson-source') {
  resetHighlightedFeature()
  if (feature.id) {
    highlightedFeatureId = feature.id
    // load feature from source, the style only returns the dimensions on screen
    const sourceFeature = geojsonData.features.find(f => f.id === feature.id)
    showFeatureDetails(sourceFeature)
    if (draw) { draw.changeMode('simple_select', { featureIds: [feature.id] }) }
    // A feature's state is not part of the GeoJSON or vector tile data
    map.setFeatureState({ source, id: feature.id },
      { active: true })
  }
}

export function initializeViewStyles () {
  viewStyleNames.forEach(styleName => {
    map.addLayer(styles[styleName])

    // click is only needed for mobile now
    map.on('click', styleName, function (e) {
      if (!e.features?.length || window.gon.map_mode === 'static') { return }
      highlightFeature(e.features[0])
    })
  })

  map.on('mousemove', (e) => {
    resetHighlightedFeature()
    const features = map.queryRenderedFeatures(e.point)
    if (!features?.length || window.gon.map_mode === 'static') { return }
    if (features[0].source === 'geojson-source') {
      highlightFeature(features[0])
    } else {
      // console.log(features[0])
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

const featureColor = 'rgb(10, 135, 10)' // green
const featureOutlineColor = 'white'

const fillColor = ['coalesce',
  ['get', 'fill'], ['get', 'user_fill'], featureColor]
const fillOpacity = ['*', 0.7, ['to-number', ['coalesce',
  ['get', 'fill-opacity'], ['get', 'user_fill-opacity'], 1]]]
const fillOpacityActive = ['*', 0.7, fillOpacity]

const lineColor = ['coalesce', ['get', 'stroke'], ['get', 'user_stroke'], featureColor]
const lineWidth = ['to-number', ['coalesce',
  ['get', 'stroke-width'], ['get', 'user_stroke-width'], 3]]
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
export const pointSize = ['to-number', ['coalesce',
  ['get', 'user_marker-size'], ['get', 'marker-size'],
  ['case',
    ['any', ['has', 'user_marker-symbol'], ['has', 'marker-symbol']],
    16, 6]]]
const pointSizeActive = ['+', 2, pointSize]
const pointOutlineSize = ['to-number', ['coalesce', ['get', 'user_stroke-width'], ['get', 'stroke-width'], 2]]
export const pointOutlineSizeActive = ['+', 1, pointOutlineSize]
const pointOutlineColor = ['coalesce', ['get', 'user_stroke'], ['get', 'stroke'], featureOutlineColor]
const pointOutlineColorActive = 'lightgrey'
const pointOpacity = 0.7
const pointOpacityActive = 0.9

// factor of the original icon size (72x72)
// in case of icon url, we don't know the size
// default: 1/6 = 12px (2 * default radius pointSize)
const iconSizeFactor = ['/', pointSize, 6]
const iconSize = ['*', 1 / 8, iconSizeFactor]
// const iconSizeActive = ['*', 1.1, iconSize] // icon-size is not a paint property
const labelSize = ['to-number', ['coalesce', ['get', 'user_label-size'], ['get', 'label-size'], 16]]

export const styles = {
  'polygon-layer': {
    id: 'polygon-layer',
    type: 'fill',
    source: 'geojson-source',
    filter: ['all',
      ['in', '$type', 'Polygon'],
      ['!=', 'active', 'true']],
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
      'fill-extrusion-opacity': 0.7
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
  'points-layer': {
    id: 'points-layer',
    type: 'circle',
    source: 'geojson-source',
    filter: ['all',
      ['==', '$type', 'Point'],
      ['!=', 'active', 'true']
    ],
    paint: {
      'circle-pitch-scale': 'map', // points get bigger when camera is closer
      'circle-radius': ['case',
        ['boolean', ['feature-state', 'active'], false],
        pointSizeActive,
        pointSize
      ],
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
      'circle-blur': 0.1,
      'circle-stroke-color': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        pointOutlineColorActive,
        pointOutlineColor
      ],
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        pointOutlineSizeActive,
        pointOutlineSize
      ],
      'circle-stroke-opacity': pointOpacity + 0.2
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
      'circle-radius': ['+', 5, pointSize],
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
      'icon-size': iconSize, // cannot scale on hover because it's not a paint property
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
      // must be available via glyphs:
      // openmaptiles: https://github.com/openmaptiles/fonts/tree/gh-pages
      // maptiler: https://docs.maptiler.com/gl-style-specification/glyphs/
      // Emojis are not in the character range: https://github.com/maplibre/maplibre-gl-js/issues/2307
      'text-font': ['Klokantech Noto Sans Regular'],
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
      'text-color': ['coalesce', ['get', 'label-color'], '#000'],
      'text-halo-color': ['coalesce', ['get', 'label-shadow'], '#fff'],
      'text-halo-width': 1
    }
  }
}
