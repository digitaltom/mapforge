import { map, geojsonData } from 'maplibre/map'
import { editStyles } from 'maplibre/edit_styles'
import { mapChannel } from 'channels/map_channel'
import { MapSettingsControl, MapShareControl } from 'maplibre/controls'

// eslint expects variables to get imported, but we load the full lib in header
const MapboxDraw = window.MapboxDraw

export let draw

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

// https://github.com/mapbox/mapbox-gl-draw
export function initializeEditInteractions () {
  console.log('Initializing MapboxDraw')
  draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      line_string: true,
      point: true,
      trash: true
      // combine_features,
      // uncombine_features
    },
    styles: editStyles
  })
  map.addControl(draw, 'top-left')
  map.addControl(new MapSettingsControl(), 'top-left')
  map.addControl(new MapShareControl(), 'top-left')

  map.on('draw.create', handleCreate)
  map.on('draw.update', handleUpdate)
  map.on('draw.delete', handleDelete)
}

function handleCreate (e) {
  const feature = e.features[0] // Assuming one feature is created at a time

  console.log('Feature ' + feature.id + ' created')
  mapChannel.send_message('new_feature', feature)
}

function handleUpdate (e) {
  const feature = e.features[0] // Assuming one feature is created at a time

  console.log('Feature ' + feature.id + ' changed')
  const geojsonFeature = geojsonData.features.find(f => f.id === feature.id)
  geojsonFeature.geometry = feature.geometry

  // also update the geojson-source (feature rendered via initializeEditStyles)
  // to avoid animation
  map.getSource('geojson-source').setData(geojsonData)
  mapChannel.send_message('update_feature', feature)
}

function handleDelete (e) {
  const deletedFeature = e.features[0] // Assuming one feature is deleted at a time

  console.log('Feature ' + deletedFeature.id + ' deleted')
  mapChannel.send_message('delete_feature', deletedFeature)
}
