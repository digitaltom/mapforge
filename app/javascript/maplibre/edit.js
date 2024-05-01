import { map } from 'maplibre/map'
import { editStyles } from 'maplibre/edit_styles'
import { mapChannel } from 'channels/map_channel'

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

  map.on('draw.create', handleCreate)
  map.on('draw.update', handleUpdate)
  map.on('draw.delete', handleDelete)

  map.on('click', 'points-layer', function (e) {
    if (e.features.length > 0) {
      const clickedFeature = e.features[0]
      console.log('Clicked feature:', clickedFeature)
    }
  })
}

function handleCreate (e) {
  const feature = e.features[0] // Assuming one feature is created at a time

  console.log('Feature ' + feature.id + ' has been created')
  mapChannel.send_message('new_feature', feature)
}

function handleUpdate (e) {
  const feature = e.features[0] // Assuming one feature is created at a time

  console.log('Feature ' + feature.id + ' has been changed')
  mapChannel.send_message('update_feature', feature)
}

function handleDelete (e) {
  const deletedFeature = e.features[0] // Assuming one feature is deleted at a time

  console.log('Feature ' + deletedFeature.id + ' has been deleted')
  mapChannel.send_message('delete_feature', deletedFeature)
}
