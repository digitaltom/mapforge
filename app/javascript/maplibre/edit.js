import { map, geojsonData, initializeDefaultControls } from 'maplibre/map'
import { editStyles, initializeEditStyles } from 'maplibre/edit_styles'
import { mapChannel } from 'channels/map_channel'
import { ControlGroup, MapSettingsControl, MapShareControl, MapLayersControl, resetControls } from 'maplibre/controls'
import { showFeatureDetails } from 'maplibre/modals'
import { status } from 'helpers/status'
import * as f from 'helpers/functions'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import * as MapboxDrawWaypoint from 'mapbox-gl-draw-waypoint'
import PaintMode from 'mapbox-gl-draw-paint-mode'

export let draw
let selectedFeature
export let editPopup

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

// https://github.com/mapbox/mapbox-gl-draw
export function initializeEditMode () {
  console.log('Initializing MapboxDraw')
  const modes = MapboxDrawWaypoint.enable(MapboxDraw.modes)
  draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      line_string: true,
      point: true,
      trash: false,
      combine_features: false
      // uncombine_features
    },
    styles: editStyles,
    // user properties are available, prefixed with 'user_'
    userProperties: true,
    // MapboxDrawWaypoint disables dragging polygons + lines,
    // + switches to direct_select mode directly
    modes: {
      ...modes,
      draw_paint_mode: PaintMode
    }
  })

  map.once('style.load', () => {
    initializeDefaultControls()

    map.addControl(draw, 'top-left')

    const controlGroup = new ControlGroup(
      [new MapSettingsControl(),
        new MapLayersControl(),
        new MapShareControl()])
    map.addControl(controlGroup, 'top-left')
  })

  map.on('geojson.load', function (e) {
    // register callback to reload edit styles when source layer changed
    map.on('sourcedata', sourcedataHandler)

    // draw has its own style layers based on editStyles
    if (geojsonData.features.length > 0) {
      draw.set(geojsonData)
    }
  })

  map.on('draw.selectionchange', function (e) {
    if (!e.features?.length) { return }
    selectedFeature = e.features[0]
    if (selectedFeature) {
      status('selected ' + selectedFeature.id)
      console.log('selected: ' + JSON.stringify(selectedFeature))
      displayEditButtons(selectedFeature)
      showFeatureDetails(selectedFeature)
    }
  })

  map.on('draw.create', handleCreate)
  map.on('draw.update', handleUpdate)
  map.on('draw.delete', handleDelete)

  // Mapbox Draw kills the click event on mobile (https://github.com/mapbox/mapbox-gl-js/issues/9114)
  // patching click on touchstart + touchend on same position
  let touchStartPosition
  let touchEndPosition
  map.on('touchstart', (e) => {
    touchStartPosition = e.point
  })
  map.on('touchend', (e) => {
    touchEndPosition = e.point
    if (touchStartPosition.x === touchEndPosition.x &&
      touchStartPosition.y === touchEndPosition.y) {
      resetControls()
    }
  })
}

function sourcedataHandler (e) {
  if (e.sourceId === 'mapbox-gl-draw-cold' && e.isSourceLoaded) {
    // Unsubscribe to avoid multiple triggers
    map.off('sourcedata', sourcedataHandler)
    // initialize additional styles (icons) after draw is loaded
    initializeEditStyles()
  }
}

function displayEditButtons (feature) {
  document.querySelector('#edit-buttons').classList.remove('hidden')
  // Add event listeners for buttons
  f.addEventListeners(document.querySelector('#edit-button-trash'), ['click', 'touchstart'],
    function () { handleDelete({ features: [feature] }) })
  f.addEventListeners(document.querySelector('#edit-button-edit'), ['click', 'touchstart'],
    function () {
      document.querySelector('#edit-modal').style.display = 'block'
      document.querySelector('.feature-details-atts-edit textarea').value = JSON.stringify(feature.properties)
      document.querySelector('#edit-modal .error').innerHTML = ''
      document.querySelector('#edit-modal').setAttribute('data-feature-id', feature.id)
    })
}

function handleCreate (e) {
  const feature = e.features[0] // Assuming one feature is created at a time

  console.log('Feature ' + feature.id + ' created')
  status('Feature ' + feature.id + ' created')
  geojsonData.features.push(feature)
  mapChannel.send_message('new_feature', feature)
}

function handleUpdate (e) {
  const feature = e.features[0] // Assuming one feature is created at a time

  console.log('Feature ' + feature.id + ' changed')
  status('Feature ' + feature.id + ' changed')
  const geojsonFeature = geojsonData.features.find(f => f.id === feature.id)
  geojsonFeature.geometry = feature.geometry

  if (editPopup) { editPopup.remove() }
  // update local geojson-source (feature rendered via initializeEditStyles)
  // to avoid update/animation via hotwire callback
  map.getSource('geojson-source').setData(geojsonData)
  mapChannel.send_message('update_feature', feature)
}

function handleDelete (e) {
  const deletedFeature = e.features[0] // Assuming one feature is deleted at a time

  if (editPopup) { editPopup.remove() }
  console.log('Feature ' + deletedFeature.id + ' deleted')
  status('Feature ' + deletedFeature.id + ' deleted')
  mapChannel.send_message('delete_feature', deletedFeature)
}
