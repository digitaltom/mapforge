import {
  map, flash, mainBar, vectorSource, featureAsGeoJSON, changedFeatureQueue, updateFeature
} from 'map/map'
import { mapProperties } from 'map/properties'
import { mapChannel } from 'channels/map_channel'
import { hoverStyle, vectorStyle, sketchStyle } from 'map/styles'
import { createFeatureId, resetInteractions } from 'map/interactions'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export let drawInteraction, pointInteraction, lineInteraction, modifyInteraction,
  undoInteraction, selectEditInteraction

export function initializeEditInteractions () {
  // Undo redo interaction (https://github.com/Viglino/ol-ext/blob/master/src/interaction/UndoRedo.js)
  undoInteraction = new ol.interaction.UndoRedo()
  undoInteraction.define('changeproperties', function (args) {
    // undo
    const feature = featureAsGeoJSON(args.feature)
    feature.properties = args.oldProps
    updateFeature(feature)
    mapChannel.send_message('update_feature', feature)
  }, function (args) {
    // redo
    const feature = featureAsGeoJSON(args.feature)
    feature.properties = args.newProps
    updateFeature(feature)
    mapChannel.send_message('update_feature', feature)
  })
  map.addInteraction(undoInteraction)

  const selectedFeatures = new ol.Collection()
  selectEditInteraction = new ol.interaction.Select({
    features: selectedFeatures,
    style: sketchStyle,
    multi: false,
    hitTolerance: 10
  })

  drawInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'Polygon'
  })

  pointInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'Point'
  })

  lineInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'LineString'
  })

  // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
  modifyInteraction = new ol.interaction.Modify({
    source: vectorSource,
    style: hoverStyle,
    pixelTolerance: 10
  })

  // Control bar: https://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Bar.html
  const editBar = new ol.control.Bar({
    position: 'top-left',
    group: true, // group controls together
    toggleOne: true, // one control active at the same time
    className: 'edit-bar',
    controls: [
      new ol.control.Button({
        html: "<i class='las la-map-marked-alt'></i>",
        title: 'Map properties',
        className: 'buttons button-map',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-map').classList.add('active')
          document.querySelector('#map-modal').style.display = 'block'
          console.log(mapProperties)
          document.querySelector('#map-name').value = mapProperties.name
        }
      }),
      new ol.control.Button({
        html: "<i class='lar la-edit'></i>",
        title: 'Modify map elements',
        className: 'buttons button-modify',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-modify').classList.add('active')
          map.addInteraction(selectEditInteraction)
          map.addInteraction(modifyInteraction)
          flash('Click on a map element to modify it')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-map-marker'></i>",
        title: 'Add map marker',
        className: 'buttons button-marker',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-marker').classList.add('active')
          map.addInteraction(pointInteraction)
          flash('Click on a location to place a marker')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-pencil-alt'></i>",
        title: 'Add a line to the map',
        className: 'buttons button-line',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-line').classList.add('active')
          map.addInteraction(lineInteraction)
          flash('Click on a location to start drawing a line')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-draw-polygon'></i>",
        title: 'Add a polygon to the map',
        className: 'buttons button-polygon',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-polygon').classList.add('active')
          map.addInteraction(drawInteraction)
          flash('Click on a location on your map to start marking an area')
        }
      })
    ]
  })

  mainBar.addControl(editBar)

  const undoBar = new ol.control.Bar({
    group: true,
    className: 'undo-bar',
    controls: [
      new ol.control.Button({
        html: "<i class='las la-undo-alt'></i>",
        title: 'Undo last change',
        className: 'button-undo hidden',
        handleClick: function () {
          undoInteraction.undo()
          flash('Reverted one change', 'success')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-redo-alt'></i>",
        title: 'Redo last change',
        className: 'button-redo hidden',
        handleClick: function () {
          undoInteraction.redo()
          flash('Re-applied one change', 'success')
        }
      })
    ]
  })
  mainBar.addControl(undoBar)

  // feature was changed or redo was called
  undoInteraction.on('stack:add', function (e) {
    // once first change was done, show undo/redo
    document.querySelector('.button-undo').classList.remove('hidden')
    document.querySelector('.button-redo').classList.remove('hidden')
  })

  undoInteraction.on('stack:clear', function (e) {
    document.querySelector('.button-undo').classList.add('hidden')
    document.querySelector('.button-redo').classList.add('hidden')
  })

  undoInteraction.on('undo', function (e) {
    const feature = e.action.feature
    console.log(e.action.feature)
    // undo changed/added feature -> remove from server
    if (e.action.type === 'addfeature') {
      mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
    }
    // undo removed feature -> add to server
    if (e.action.type === 'removefeature') {
      mapChannel.send_message('new_feature', featureAsGeoJSON(feature))
    }
    if (e.action.type === 'changegeometry') {
      mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
    }
  })

  undoInteraction.on('redo', function (e) {
    const feature = e.action.feature
    // redo changed/added feature -> add to server
    if (e.action.type === 'addfeature') {
      mapChannel.send_message('new_feature', featureAsGeoJSON(feature))
    }
    // redo removed feature -> remove from server
    if (e.action.type === 'removefeature') {
      mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
    }
    if (e.action.type === 'changegeometry') {
      mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
    }
  })

  selectEditInteraction.on('select', function (e) {
    const selectedFeatures = e.selected
    const deselectedFeatures = e.deselected
    // in case a modify interaction is active, those feautures
    // are temporary copies in a differenct format
    // hide old details first, then show new one
    Array.from(deselectedFeatures).forEach(function (feature) {
      if (feature.values_.features) { feature = feature.values_.features[0] }
      console.log('deselected ' + JSON.stringify(feature.getId()))
      hideFeatureEdit()
      feature.setStyle(vectorStyle(feature))
    })
    Array.from(selectedFeatures).forEach(function (feature) {
      if (feature.values_.features) { feature = feature.values_.features[0] }
      console.log('selected ' + JSON.stringify(feature.getId()))
      showFeatureEdit(feature)
      feature.setStyle(hoverStyle(feature))
    })
  })

  modifyInteraction.on('modifystart', function (event) {
    console.log('Modification started')
  })

  modifyInteraction.on('modifyend', function (e) {
    // console.log('changedFeatureQueue: ' + changedFeatureQueue)
    // don't use e.features.getArray() here, because it contains all map/selected features
    while (changedFeatureQueue.length > 0) {
      const feature = changedFeatureQueue.pop()
      console.log('Feature ' + feature.getId() + ' has been modified')
      mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
      flash('Feature updated', 'success')
    }
  });

  [drawInteraction, pointInteraction, lineInteraction].forEach(function (element) {
    element.on('drawend', function (e) {
      e.feature.setId(createFeatureId())
      console.log('Feature ' + e.feature.getId() + ' has been created')
      flash('Feature added', 'success')
      mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature))
    })
  })
}

export function showFeatureEdit (feature) {
  const detailsContainer = document.querySelector('.feature-details-edit')
  detailsContainer.dataset.featureId = feature.getId()
  detailsContainer.querySelector('.feature-details-title').innerHTML = feature.getId()
  detailsContainer.querySelector('.feature-details-desc').innerHTML = ''
  detailsContainer.querySelector('.feature-details-atts-edit textarea').value = JSON.stringify(featureAsGeoJSON(feature).properties) || '{}'
  detailsContainer.style.display = 'block'
  detailsContainer.style.opacity = '0.9'
}

export function hideFeatureEdit () {
  const el = document.querySelector('.feature-details-edit')
  el.style.opacity = '0'
  // remove from DOM if faded out
  setTimeout(function () { if (el.style.opacity === '0') { el.style.display = 'none' } }, 1000)
}
