import { map, geojsonData, initializeDefaultControls, destroy, redrawGeojson } from 'maplibre/map'
import { editStyles, initializeEditStyles } from 'maplibre/edit_styles'
import { highlightFeature } from 'maplibre/feature'
import { mapChannel } from 'channels/map_channel'
import {
  ControlGroup, MapSettingsControl, MapShareControl, MapLayersControl,
  resetControls
} from 'maplibre/controls'
import { status } from 'helpers/status'
import * as functions from 'helpers/functions'
import equal from 'fast-deep-equal' // https://github.com/epoberezkin/fast-deep-equal
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import PaintMode from 'mapbox-gl-draw-paint-mode'

export let draw
export let selectedFeature
let justCreated = false

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

// https://github.com/mapbox/mapbox-gl-draw
export function initializeEditMode () {
  console.log('Initializing MapboxDraw')

  // Patching direct select mode to not allw dragging features
  // similar to https://github.com/zakjan/mapbox-gl-draw-waypoint
  const DirectSelectMode = { ...MapboxDraw.modes.direct_select }
  DirectSelectMode.dragFeature = function (state, e, delta) { /* noop */ }

  const modes = {
    ...MapboxDraw.modes,
    direct_select: DirectSelectMode,
    draw_paint_mode: PaintMode
  }

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
    modes
  })

  initializeDefaultControls()
  map.addControl(draw, 'top-left')
  addPaintButton()
  document.querySelector('.maplibregl-ctrl:has(button.mapbox-gl-draw_line)').setAttribute('data-aos', 'fade-right')

  const controlGroup = new ControlGroup(
    [new MapSettingsControl(),
      new MapLayersControl(),
      new MapShareControl()])
  map.addControl(controlGroup, 'top-left')
  document.querySelector('.maplibregl-ctrl:has(button.maplibregl-ctrl-map)').setAttribute('data-aos', 'fade-right')

  map.on('geojson.load', function (e) {
    initializeEditStyles()
    const urlFeatureId = new URLSearchParams(window.location.search).get('f')
    const feature = geojsonData.features.find(f => f.id === urlFeatureId)
    if (feature) { select(feature) }
  })

  map.on('draw.modechange', () => {
    resetControls()
    if (draw.getMode() !== 'simple_select') {
      functions.e('.maplibregl-canvas', e => { e.classList.add('cursor-crosshair') })
    }
    functions.e('.mapbox-gl-draw_paint', e => { e.classList.remove('active') })
    if (draw.getMode() === 'draw_paint_mode') {
      functions.e('.mapbox-gl-draw_paint', e => { e.classList.add('active') })
    } else if (draw.getMode() === 'draw_point') {
      status('Point Mode: Click on the map to place a marker', 'info', 'medium', 8000)
    } else if (draw.getMode() === 'draw_polygon') {
      status('Polygon Mode: Click on the map to draw a polygon', 'info', 'medium', 8000)
    } else if (draw.getMode() === 'draw_line_string') {
      status('Line Mode: Click on the map to draw a line', 'info', 'medium', 8000)
    }
    console.log('draw mode: ' + draw.getMode())
  })

  // FIXME: probably mapbox draw bug: map can lose drag capabilities on double click
  map.on('draw.selectionchange', function (e) {
    if (!e.features?.length) { return }
    if (justCreated) { justCreated = false; return }
    selectedFeature = e.features[0]
    if (selectedFeature) {
      console.log('selected: ' + JSON.stringify(selectedFeature))
      select(selectedFeature)
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
      touchStartPosition.y === touchEndPosition.y &&
      draw.getMode() === 'simple_select') {
      map.fire('click')
    }
  })

  document.querySelector('#edit-buttons').classList.remove('hidden')
}

// switching directly from 'simple_select' to 'direct_select',
// allow only to select one feature
function select (feature) {
  if (feature.geometry.type !== 'Point') {
    draw.changeMode('direct_select', { featureId: feature.id })
  } else {
    draw.changeMode('simple_select', { featureIds: [feature.id] })
  }
}

function handleCreate (e) {
  let feature = e.features[0] // Assuming one feature is created at a time

  // simplify hand-drawing
  if (draw.getMode() === 'draw_paint_mode') {
    const options = { tolerance: 0.00001, highQuality: true }
    feature = window.turf.simplify(feature, options)
  }

  status('Feature ' + feature.id + ' created')
  geojsonData.features.push(feature)
  mapChannel.send_message('new_feature', feature)

  // Prevent automatic selection + stay in create mode
  justCreated = true
  const mode = draw.getMode()
  setTimeout(() => {
    draw.changeMode(mode)
    map.fire('draw.modechange') // not fired automatically with draw.changeMode()
  }, 10)
}

function handleUpdate (e) {
  const feature = e.features[0] // Assuming one feature is updated at a time
  const geojsonFeature = geojsonData.features.find(f => f.id === feature.id)

  // mapbox-gl-draw-waypoint sends empty update when dragging on selected feature
  if (equal(geojsonFeature.geometry, feature.geometry)) {
    // console.log('Feature update event triggered without update')
    return
  }

  status('Feature ' + feature.id + ' changed')
  geojsonFeature.geometry = feature.geometry
  redrawGeojson(false)
  mapChannel.send_message('update_feature', feature)
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
  paintButton.title = 'Freehand draw'
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
      status('Paint Mode: Click on the map to start drawing, double click to finish',
        'info', 'medium', 8000)
    }
    map.fire('draw.modechange')
  })
  const parentElement = originalButton.parentElement
  parentElement.insertBefore(paintButton, originalButton.nextSibling)
}
