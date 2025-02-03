import { styles, loadImage, pointSize, pointOutlineSize, pointSizeMax } from 'maplibre/styles'
import { map, sortLayers } from 'maplibre/map'

export function initializeEditStyles () {
  // MapboxDraw cannot render symbol+text styles.
  // Adding those as extra layers to the map.
  // render the extrusion layer from "source: 'geojson-source' without having it available for edit in draw
  map.addLayer(styles()['polygon-layer-extrusion'])
  map.addLayer(styles()['symbols-border-layer'])
  map.addLayer(styles()['symbols-layer'])
  map.addLayer(styles()['text-layer'])
  sortLayers()
  console.log('Edit styles added')

  map.on('styleimagemissing', loadImage)
  // TODO setting feature state (hover) doesn't work on draw features
}

// started from https://github.com/mapbox/mapbox-gl-draw/blob/main/src/lib/theme.js
// Styling Draw: https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md#styling-draw
// mode == 'active': selected for editing
// mode != 'active': normal display
// mode == 'static': not available for editing
//
// mapbox gl draw doesn't use 'feature-state', but switches between different
// source layers 'mapbox-gl-draw-cold' + 'mapbox-gl-draw-hot'

const highlightColor = '#fbb03b'

export function editStyles () {
  return [

    removeSource(styles()['polygon-layer']), // gl-draw-polygon-fill-inactive
    removeSource(styles()['polygon-layer-outline']),
    removeSource(styles()['line-layer-outline']), , // line outline below line, because it's a wider line
    removeSource(styles()['line-layer']), // 'gl-draw-line-inactive', 'gl-draw-polygon-stroke-inactive',

    // active polygon outline
    {
      id: 'gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all',
        ['==', 'active', 'true'],
        ['==', '$type', 'Polygon']],
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': highlightColor,
        'line-dasharray': [0.2, 2],
        'line-width': 5
      }
    },
    // active linestring
    {
      id: 'gl-draw-line-active',
      type: 'line',
      filter: ['all',
        ['==', '$type', 'LineString'],
        ['==', 'active', 'true']
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': highlightColor,
        'line-dasharray': [0.2, 2],
        'line-width': 5
      }
    },
    // midpoints to extend lines/polygons
    {
      id: 'gl-draw-polygon-midpoint',
      type: 'circle',
      filter: ['all',
        ['==', '$type', 'Point'],
        ['==', 'meta', 'midpoint']],
      paint: {
        'circle-radius': pointSize,
        'circle-color': 'grey',
        'circle-opacity': 0.8,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1
      }
    },
    // default point behind symbols, transparent points etc.
    {
      id: 'gl-draw-point-point-stroke-inactive',
      type: 'circle',
      filter: ['all',
        ['==', 'active', 'false'],
        ['==', '$type', 'Point'],
        ['==', 'meta', 'feature'],
        ['!=', 'mode', 'static']
      ],
      paint: {
        'circle-radius': pointSize,
        'circle-opacity': 0.2,
        'circle-color': '#ffffff',
        'circle-stroke-color': '#c0c0c0',
        'circle-stroke-width': 1
      }
    },

    // active point, either single or on a line / polygon
    {
      id: 'gl-draw-point-stroke-active',
      type: 'circle',
      filter: ['all',
        ['==', '$type', 'Point'],
        ['==', 'active', 'true'],
        ['!=', 'meta', 'midpoint']
      ],
      paint: {
        'circle-radius': ['*', pointSizeMax, 2],
        'circle-color': '#ffffff',
        'circle-opacity': 0.2,
        'circle-stroke-color': highlightColor,
        'circle-stroke-width': 3
      }
    },
    // inactive single point features
    removeSource(styles()['points-border-layer']),
    removeSource(styles()['points-layer']),

    // inactive vertex points on lines + polygons, outline
    // renderingoutline seperately to generate nicer overlay effect
    {
      id: 'gl-draw-polygon-and-line-vertex-outline-inactive',
      type: 'circle',
      filter: ['all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      paint: {
        'circle-radius': pointSize,
        'circle-opacity': 0,
        'circle-stroke-color': '#444',
        'circle-stroke-width': pointOutlineSize,
        'circle-stroke-opacity': 1
      }
    },
    // inactive vertex points on lines + polygons
    {
      id: 'gl-draw-polygon-and-line-vertex-inactive',
      type: 'circle',
      filter: ['all',
        ['==', 'meta', 'vertex'],
        ['==', '$type', 'Point'],
        ['!=', 'mode', 'static']
      ],
      paint: {
        'circle-radius': pointSize,
        'circle-color': highlightColor
      }
    }
  ]
}

function removeSource (style) {
  const { source, ...filteredStyle } = style
  return filteredStyle
}
