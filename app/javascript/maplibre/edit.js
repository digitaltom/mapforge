import { map, geojsonSource } from 'maplibre/map'

// eslint expects variables to get imported, but we load the full lib in header
const MapboxDraw = window.MapboxDraw

export let draw

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

export function initializeEditInteractions () {
  draw = new MapboxDraw({})
  map.addControl(draw, 'top-left')

  map.on('draw.create', handleCreate)
  // map.on('draw.update', handleUpdate)
  // map.on('draw.delete', handleDelete)
}

function handleCreate (e) {
  const source = map.getSource('geojson-source')
  const feature = e.features[0] // Assuming one feature is created at a time
  console.log(feature)
  geojsonSource.features.push(feature)
  source.setData(geojsonSource)
}
