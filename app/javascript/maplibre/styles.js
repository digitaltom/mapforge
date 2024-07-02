import { map, geojsonData } from 'maplibre/map'
import * as f from 'helpers/functions'
import { showFeatureDetails } from 'maplibre/modals'

let highlightedFeatureId
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
const fillOpacityActive = ['*', 0.4, ['to-number', ['coalesce',
  ['get', 'fill-opacity'], ['get', 'user_fill-opacity'], 1]]]

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

const pointColor = ['coalesce', ['get', 'user_marker-color'], ['get', 'marker-color'], featureColor]
const pointSize = ['coalesce', ['get', 'user_marker-size'], ['get', 'marker-size'], 6]
const pointSizeActive = ['+', 1, pointSize]
const pointOutlineSize = ['+', 2, pointSize]
const pointOutlineSizeActive = ['+', 1, pointOutlineSize]
const pointOutlineColor = ['coalesce', ['get', 'user_stroke'], ['get', 'stroke'], featureOutlineColor]
const pointOpacity = 0.7
const pointOpacityActive = 0.9

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
        'transparent', 0, // If marker-color is 'transparent', set circle-radius to 0
        ['case',
          ['boolean', ['feature-state', 'active'], false],
          pointOutlineSizeActive,
          pointOutlineSize
        ]],
      'circle-color': pointOutlineColor
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
        ['case',
          ['boolean', ['feature-state', 'active'], false],
          pointSizeActive,
          pointSize
        ]],
      'circle-color': pointColor,
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'active'], false],
        pointOpacityActive,
        pointOpacity
      ]
    }
  },
  'points-hit-layer': {
    id: 'points-hit-layer',
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
      'circle-radius': ['+', 3, pointOutlineSize],
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
      'icon-ignore-placement': true // other symbols can be visible even if they collide with the icon
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
        'true', 1.2,
        0.6
      ],
      'text-justify': 'auto',
      'text-ignore-placement': false // hide on collision
    },
    paint: {
      'text-color': ['coalesce', ['get', 'label-color'], '#fff'],
      'text-halo-color': ['coalesce', ['get', 'label-shadow'], '#444'],
      'text-halo-width': 1
    }
  }
}
