import {
  map, flash, mainBar, vectorSource, featureAsGeoJSON, locate, changedFeatureQueue,
  deleteFeature
} from 'map/map'
import { mapProperties } from 'map/map_properties'
import { mapChannel } from 'channels/map_channel'
import { hoverStyle, vectorStyle } from 'map/styles'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export let drawInteraction, pointInteraction, lineInteraction, modifyInteraction, selectInteraction
let locationIntervall
export let undoInteraction

export function initializeInteractions () {
  // Undo redo interaction (https://github.com/Viglino/ol-ext/blob/master/src/interaction/UndoRedo.js)
  undoInteraction = new ol.interaction.UndoRedo()
  map.addInteraction(undoInteraction)

  // Select interaction
  const selectedFeatures = new ol.Collection()
  selectInteraction = new ol.interaction.Select({
    features: selectedFeatures,
    style: hoverStyle,
    multi: false,
    hitTolerance: 10
  })

  drawInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: hoverStyle,
    type: 'Polygon'
  })

  pointInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: hoverStyle,
    type: 'Point'
  })

  lineInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: hoverStyle,
    type: 'LineString'
  })

  // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
  modifyInteraction = new ol.interaction.Modify({
    source: vectorSource,
    style: hoverStyle,
    pixelTolerance: 10
  })

  const viewButton = new ol.control.Button({
    html: "<i class='las la-mouse-pointer'></i>",
    title: 'Select',
    className: 'buttons button-select active',
    handleClick: function () {
      resetInteractions()
      document.querySelector('.button-select').classList.add('active')
      map.addInteraction(selectInteraction)
    }
  })

  // Control bar: https://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Bar.html
  const editBar = new ol.control.Bar({
    group: true,
    toggleOne: true,
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
          map.addInteraction(selectInteraction)
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

  mainBar.addControl(viewButton)
  mainBar.addControl(editBar)
  map.addInteraction(selectInteraction)

  const undoBar = new ol.control.Bar({
    group: true,
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

  const mapNavBar = new ol.control.Bar({
    group: false,
    controls: [
      new ol.control.Button({
        html: "<i class='las la-crosshairs'></i>",
        title: 'Center at your current location',
        className: 'button button-locate',
        handleClick: function () {
          if (!locationIntervall) {
            document.querySelector('.button-locate').classList.add('active')
            locate()
            locationIntervall = setInterval(locate, 10000)
          } else {
            document.querySelector('.button-locate').classList.remove('active')
            clearInterval(locationIntervall)
            locationIntervall = null
          }
        }
      })
    ]
  })
  map.addControl(mapNavBar)
  mapNavBar.setPosition('right-top')

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

  selectInteraction.on('select', function (e) {
    const selectedFeatures = e.selected
    const deselectedFeatures = e.deselected
    // in case a modify interaction is active, those feautures
    // are temporary copies in a differenct format
    // hide old details first, then show new one
    Array.from(deselectedFeatures).forEach(function (feature) {
      if (feature.values_.features) { feature = feature.values_.features[0] }
      console.log('deselected ' + JSON.stringify(feature.getId()))
      hideFeatureDetails()
      feature.setStyle(vectorStyle(feature))
    })
    Array.from(selectedFeatures).forEach(function (feature) {
      if (feature.values_.features) { feature = feature.values_.features[0] }
      console.log('selected ' + JSON.stringify(feature.getId()))
      showFeatureDetails(feature)
      feature.setStyle(hoverStyle(feature))
    })
  })

  let previouslySelectedFeature = null
  let currentlySelectedFeature = null

  map.on('pointermove', function (event) {
    // skip hover effects when in an active modification
    if (modifyInteraction.getActive() || lineInteraction.getActive() ||
        drawInteraction.getActive() || pointInteraction.getActive()) { return true }
    if (isMobileDevice()) { return true }
    // skip hover whe there is a modal shown
    if (document.querySelector('#map-modal').style.display === 'block') { return true }
    // skip hover effects when features are selected
    if (selectInteraction.getFeatures().getArray().length) { return true }

    currentlySelectedFeature = null
    map.forEachFeatureAtPixel(event.pixel, function (feature) {
      if (feature.getId() === undefined) { return false }
      currentlySelectedFeature = feature
      if (previouslySelectedFeature == null ||
      feature.getId() !== previouslySelectedFeature.getId()) {
        feature.setStyle(hoverStyle(feature))
        showFeatureDetails(feature)
      }
      return true
    }, {
      hitTolerance: 10 // Tolerance in pixels
    })

    // reset style of no more hovered feature
    if (previouslySelectedFeature &&
        (currentlySelectedFeature == null ||
          currentlySelectedFeature.getId() !== previouslySelectedFeature.getId())) {
      previouslySelectedFeature.setStyle(vectorStyle(previouslySelectedFeature))
      if (currentlySelectedFeature == null) { hideFeatureDetails() }
    }
    previouslySelectedFeature = currentlySelectedFeature
  })
}

function showFeatureDetails (feature) {
  const detailsContainer = document.querySelector('.feature-details-window')
  detailsContainer.dataset.featureId = feature.getId()
  detailsContainer.querySelector('.feature-details-title').innerHTML = feature.get('title') || feature.getId()
  detailsContainer.querySelector('.feature-details-desc').innerHTML = feature.get('description')
  const deleteButton = detailsContainer.querySelector('.feature-delete')
  deleteButton.removeEventListener('click', deleteClick)
  deleteButton.addEventListener('click', deleteClick)
  detailsContainer.style.display = 'block'
  detailsContainer.style.opacity = '0.9'
}

function deleteClick () {
  const detailsContainer = document.querySelector('.feature-details-window')
  const feature = vectorSource.getFeatureById(detailsContainer.dataset.featureId)
  selectInteraction.getFeatures().remove(feature)
  deleteFeature(feature)
  mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
  flash('Feature deleted', 'success')
}

export function hideFeatureDetails () {
  const el = document.querySelector('.feature-details-window')
  el.style.opacity = '0'
  // remove from DOM if faded out
  setTimeout(function () { if (el.style.opacity === '0') { el.style.display = 'none' } }, 1000)
}

export function resetInteractions () {
  map.removeInteraction(drawInteraction)
  map.removeInteraction(pointInteraction)
  map.removeInteraction(lineInteraction)
  map.removeInteraction(modifyInteraction)
  map.removeInteraction(selectInteraction)
  Array.from(document.getElementsByClassName('buttons')).forEach(function (button) {
    button.classList.remove('active')
  })
  document.querySelector('#map-modal').style.display = 'none'
  hideFeatureDetails()
}

function createFeatureId () {
  return Math.random().toString(16).slice(2)
}

function isMobileDevice () {
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
}
