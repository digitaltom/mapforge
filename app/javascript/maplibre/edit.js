import { map, geojsonData, initializeDefaultControls, lastMousePosition } from 'maplibre/map'
import { editStyles, initializeEditStyles } from 'maplibre/edit_styles'
import { mapChannel } from 'channels/map_channel'
import { ControlGroup, MapSettingsControl, MapShareControl, MapLayersControl, resetControls } from 'maplibre/controls'
import * as f from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header
const MapboxDraw = window.MapboxDraw
const maplibregl = window.maplibregl

export let draw
let selectedFeature
export let editPopup

MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl'
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-'
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group'

// https://github.com/mapbox/mapbox-gl-draw
export function initializeEditMode () {
  console.log('Initializing MapboxDraw')
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
    userProperties: true
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
    // callback to load edit styles on top of draw styles.
    // triggered once when 'draw' is initialized
    map.on('sourcedata', sourcedataHandler)

    // draw has its own layers based on editStyles
    draw.set(geojsonData)
  })

  map.on('draw.selectionchange', function (e) {
    selectedFeature = e.features[0]
    if (selectedFeature) {
      console.log('selected: ' + JSON.stringify(selectedFeature))
      displayEditButtons(selectedFeature)
    }
  })

  map.on('draw.create', handleCreate)
  map.on('draw.update', handleUpdate)
  map.on('draw.delete', handleDelete)

  map.on('click', resetControls)
  map.on('touchstart', resetControls)
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
  let coordinates = lastMousePosition
  if (feature.geometry.type === 'Point') {
    coordinates = feature.geometry.coordinates
  }
  editPopup = new maplibregl.Popup({
    closeButton: false,
    className: 'edit-popup',
    offset: [0, -20]
  })
    .setLngLat(coordinates)
    .setHTML(document.getElementById('edit-buttons').innerHTML)
    .addTo(map)

  // Add event listeners for buttons
  f.addEventListeners(document.querySelector('#edit-button-trash'), ['click', 'touchstart'],
    function () { draw.trash() })
  f.addEventListeners(document.querySelector('#edit-button-edit'), ['click', 'touchstart'],
    function () {
      document.querySelector('#edit-modal').style.display = 'block'
      document.querySelector('.feature-details-atts-edit textarea').value = JSON.stringify(feature.properties)
      document.querySelector('#edit-modal').setAttribute('data-feature-id', feature.id)
    })
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
  mapChannel.send_message('delete_feature', deletedFeature)
}
