import { map, geojsonData, initializeDefaultControls, redrawGeojson, destroy } from 'maplibre/map'
import { editStyles, initializeEditStyles } from 'maplibre/edit_styles'
import { highlightFeature } from 'maplibre/feature'
import { mapChannel } from 'channels/map_channel'
import {
  ControlGroup, MapSettingsControl, MapShareControl, MapLayersControl,
  resetControls
} from 'maplibre/controls'
import { status } from 'helpers/status'
import * as functions from 'helpers/functions'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import * as MapboxDrawWaypoint from 'mapbox-gl-draw-waypoint'
import PaintMode from 'mapbox-gl-draw-paint-mode'

// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

export let draw
export let selectedFeature

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
    clickBuffer: 5,
    touchBuffer: 25, // default 25
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
    addPaintButton()
    const controlGroup = new ControlGroup(
      [new MapSettingsControl(),
        new MapLayersControl(),
        new MapShareControl()])
    map.addControl(controlGroup, 'top-left')
  })

  map.on('geojson.load', function (e) {
    // register callback to reload edit styles when source layer changed
    map.on('sourcedata', sourcedataHandler)
    const urlFeatureId = new URLSearchParams(window.location.search).get('f')
    const feature = geojsonData.features.find(f => f.id === urlFeatureId)
    if (feature) {
      selectedFeature = feature
      draw.changeMode('simple_select', { featureIds: [feature.id] })
    }
  })

  map.on('draw.modechange', () => {
    resetControls()
    if (draw.getMode() === 'draw_paint_mode') {
      functions.e('.mapbox-gl-draw_paint', e => { e.classList.add('active') })
    } else {
      functions.e('.mapbox-gl-draw_paint', e => { e.classList.remove('active') })
    }
  })
  map.on('draw.selectionchange', function (e) {
    if (!e.features?.length) { return }
    selectedFeature = e.features[0]
    if (selectedFeature) {
      console.log('selected: ' + JSON.stringify(selectedFeature))
      highlightFeature(selectedFeature, true)
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

  document.querySelector('#edit-buttons').classList.remove('hidden')
}

function sourcedataHandler (e) {
  if (e.sourceId === 'mapbox-gl-draw-cold' && e.isSourceLoaded) {
    // Unsubscribe to avoid multiple triggers
    map.off('sourcedata', sourcedataHandler)
    // initialize additional styles (icons) after draw is loaded
    initializeEditStyles()
  }
}

function handleCreate (e) {
  let feature = e.features[0] // Assuming one feature is created at a time

  if (draw.getMode() === 'draw_paint_mode') {
    const options = { tolerance: 0.00001, highQuality: true }
    feature = turf.simplify(feature, options)
  }

  status('Feature ' + feature.id + ' created')
  geojsonData.features.push(feature)
  mapChannel.send_message('new_feature', feature)
}

function handleUpdate (e) {
  const feature = e.features[0] // Assuming one feature is updated at a time

  status('Feature ' + feature.id + ' changed')
  const geojsonFeature = geojsonData.features.find(f => f.id === feature.id)
  geojsonFeature.geometry = feature.geometry
  mapChannel.send_message('update_feature', feature)
  redrawGeojson()
  // trigger highlight, to update eg. coordinates
  highlightFeature(feature, true)
}

export function handleDelete (e) {
  selectedFeature = null
  const deletedFeature = e.features[0] // Assuming one feature is deleted at a time
  destroy(deletedFeature.id)
  status('Feature ' + deletedFeature.id + ' deleted')
  mapChannel.send_message('delete_feature', { id: deletedFeature.id })
}

export function disableEditControls () {
  functions.e('.mapbox-gl-draw_ctrl-draw-btn', e => { e.disabled = true })
  functions.e('.maplibregl-ctrl-map', e => { e.disabled = true })
  functions.e('#save-map-name', e => { e.disabled = true })
  functions.e('#save-map-defaults', e => { e.disabled = true })
}

export function enableEditControls () {
  functions.e('.mapbox-gl-draw_ctrl-draw-btn', e => { e.disabled = false })
  functions.e('.maplibregl-ctrl-map', e => { e.disabled = false })
  functions.e('#save-map-name', e => { e.disabled = false })
  functions.e('#save-map-defaults', e => { e.disabled = false })
}

function addPaintButton () {
  const originalButton = document.querySelector('.mapbox-gl-draw_line')
  const paintButton = originalButton.cloneNode(true)
  paintButton.classList.remove('mapbox-gl-draw_line')
  paintButton.classList.add('mapbox-gl-draw_paint')
  const icon = document.createElement('i')
  icon.classList.add('bi')
  icon.classList.add('bi-pencil-fill')
  paintButton.appendChild(icon)
  paintButton.removeEventListener('click', null)
  paintButton.addEventListener('click', (e) => {
    if (draw.getMode() === 'draw_paint_mode') {
      draw.changeMode('simple_select')
    } else {
      draw.changeMode('draw_paint_mode')
      status('Paint Mode: Click on the map to start drawing, double click to finish', 8000)
    }
    map.fire('draw.modechange')
  })
  const parentElement = originalButton.parentElement
  parentElement.insertBefore(paintButton, originalButton.nextSibling)
}
