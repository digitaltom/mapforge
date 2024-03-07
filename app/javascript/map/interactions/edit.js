import {
  map, flash, mainBar, vectorSource, featureAsGeoJSON, changedFeatureQueue, updateProps, vectorLayer
} from 'map/map'
import { mapProperties } from 'map/properties'
import { mapChannel } from 'channels/map_channel'
import { hoverStyle, vectorStyle, sketchStyle } from 'map/styles'
import { createFeatureId, resetInteractions, isMobileDevice } from 'map/interactions'
import { selectInteraction } from 'map/interactions/readonly'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const turf = window.turf

export let drawInteraction, polygonInteraction, pointInteraction, lineInteraction,
  modifyInteraction, undoInteraction, selectEditInteraction, bannerInteraction

export function initializeEditInteractions () {
  initializeSelectInteraction()
  initializeModifyInteraction()
  initializeUndoInteraction()
  initializePaintInteractions()

  // Control bar: https://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Bar.html
  const editBar = new ol.control.Bar({
    group: true, // group controls together
    toggleOne: true, // one control active at the same time
    className: 'edit-bar',
    controls: [
      new ol.control.Button({
        html: "<i class='bi-pencil-square'></i>",
        title: 'Toggle edit mode',
        className: 'buttons button-edit',
        handleClick: function () {
          if (map.getInteractions().getArray().includes(selectEditInteraction)) {
            resetInteractions()
            map.addInteraction(selectInteraction)
            document.querySelector('.button-edit').classList.remove('active')
            document.querySelector('.add-sub-bar').classList.add('hidden')
          } else {
            const selectedFeature = selectInteraction.getFeatures().getArray()[0]
            resetInteractions()
            document.querySelector('.button-edit').classList.add('active')
            document.querySelector('.add-sub-bar').classList.remove('hidden')
            map.addInteraction(selectEditInteraction)
            if (selectedFeature) {
              selectEditInteraction.getFeatures().push(selectedFeature)
              selectEditInteraction.dispatchEvent({ type: 'select', selected: [selectedFeature], deselected: [] })
            }
            map.addInteraction(modifyInteraction)
            flash('Click on a map element to modify it or add new elements', 'info', 10000)
          }
        }
      }),
      new ol.control.Button({
        html: "<i class='bi-globe-americas'></i>",
        title: 'Map properties',
        className: 'buttons button-map',
        handleClick: function () {
          if (document.querySelector('#map-modal').style.display === 'block') {
            resetInteractions()
            map.addInteraction(selectInteraction)
            document.querySelector('.button-map').classList.remove('active')
          } else {
            resetInteractions()
            document.querySelector('.button-map').classList.add('active')
            document.querySelector('#map-modal').style.display = 'block'
            document.querySelector('#map-name').value = mapProperties.name
          }
        }
      }),
      new ol.control.Button({
        html: "<i class='bi-share-fill'></i>",
        title: 'Share',
        className: 'buttons button-sharing',
        handleClick: function () {
          if (document.querySelector('#share-modal').style.display === 'block') {
            resetInteractions()
            map.addInteraction(selectInteraction)
            document.querySelector('.button-sharing').classList.remove('active')
          } else {
            resetInteractions()
            document.querySelector('.button-sharing').classList.add('active')
            document.querySelector('#share-modal').style.display = 'block'
          }
        }
      })
    ]
  })
  mainBar.addControl(editBar)

  const addSubBar = new ol.control.Bar({
    group: true,
    className: 'sub-bar add-sub-bar hidden',
    controls: [
      new ol.control.Button({
        html: "<i class='bi-geo-alt'></i>",
        title: 'Add map marker',
        className: 'buttons button-marker',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-edit').classList.add('active')
          document.querySelector('.add-sub-bar').classList.remove('hidden')
          document.querySelector('.button-marker').classList.add('active')
          map.addInteraction(pointInteraction)
          flash('Click on a location to place a marker')
        }
      }),
      new ol.control.Button({
        html: "<i class='bi bi-dash'></i>",
        title: 'Add a line to the map',
        className: 'buttons button-line',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-edit').classList.add('active')
          document.querySelector('.add-sub-bar').classList.remove('hidden')
          document.querySelector('.button-line').classList.add('active')
          map.addInteraction(lineInteraction)
          flash('Click on a location to start drawing a straight line')
        }
      }),
      new ol.control.Button({
        html: "<i class='bi-brush'></i>",
        title: 'Add a freehand line to the map',
        className: 'buttons button-freehand',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-edit').classList.add('active')
          document.querySelector('.add-sub-bar').classList.remove('hidden')
          document.querySelector('.button-freehand').classList.add('active')
          map.addInteraction(drawInteraction)
          flash('Click on the map to start freehand drawing')
        }
      }),
      new ol.control.Button({
        html: "<i class='bi bi-hexagon'></i>",
        title: 'Add a polygon to the map',
        className: 'buttons button-polygon',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-edit').classList.add('active')
          document.querySelector('.add-sub-bar').classList.remove('hidden')
          document.querySelector('.button-polygon').classList.add('active')
          map.addInteraction(polygonInteraction)
          flash('Click on a location on your map to start marking an area')
        }
      }),
      new ol.control.Button({
        html: "<i class='bi-card-text'></i>",
        title: 'Add a banner to the map',
        className: 'buttons button-banner',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-edit').classList.add('active')
          document.querySelector('.add-sub-bar').classList.remove('hidden')
          document.querySelector('.button-banner').classList.add('active')
          map.addInteraction(bannerInteraction)
          flash('Click on a location on your map to create a banner')
        }
      }),
      new ol.control.Button({
        html: "<i class='bi bi-arrow-counterclockwise'></i>",
        title: 'Undo last change',
        className: 'button-undo hidden',
        handleClick: function () {
          undoInteraction.undo()
          flash('Reverted one change', 'success')
        }
      }),
      new ol.control.Button({
        html: "<i class='bi bi-arrow-clockwise'></i>",
        title: 'Redo last change',
        className: 'button-redo hidden',
        handleClick: function () {
          undoInteraction.redo()
          flash('Re-applied one change', 'success')
        }
      })
    ]
  })
  map.addControl(addSubBar)

  map.on('pointermove', function (event) {
    // skip hover effects when not in an active selectEditInteraction
    if (!map.getInteractions().getArray().includes(selectEditInteraction)) { return }
    if (event.dragging) { return }
    if (isMobileDevice()) { return }

    let currentlySelectedFeature = null
    map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
      if (feature.getId() === undefined) { return }
      currentlySelectedFeature = feature
      map.getTargetElement().style.cursor = 'pointer'
      return true
    }, {
      layerFilter: function (layer) { return layer === vectorLayer },
      hitTolerance: 10 // Tolerance in pixels
    })
    if (!currentlySelectedFeature) { map.getTargetElement().style.cursor = '' }
  })

  // reset interaction on escape
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' || event.keyCode === 27) {
      resetInteractions()
    }
  })

  // disable (banner-) links in edit mode
  document.addEventListener('click', function (event) {
    if (map.getInteractions().getArray().includes(selectEditInteraction)) {
      event.preventDefault()
    }
  })
}

export function initializeModifyInteraction () {
  // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
  modifyInteraction = new ol.interaction.Modify({
    source: vectorSource,
    style: sketchStyle,
    pixelTolerance: 10
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
  })
}

export function initializePaintInteractions () {
  pointInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'Point',
    stopClick: true
  })

  lineInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'LineString',
    stopClick: true,
    maxPoints: 500
  })

  drawInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    freehand: true,
    type: 'LineString',
    stopClick: true
  })

  polygonInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'Polygon',
    stopClick: true,
    maxPoints: 500
  })

  bannerInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: sketchStyle,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox()
  });

  [drawInteraction, pointInteraction, lineInteraction,
    polygonInteraction, bannerInteraction].forEach(function (interaction) {
    interaction.on('drawend', function (e) {
      e.feature.setId(createFeatureId())
      if (interaction === drawInteraction) {
        // https://turfjs.org/docs/#simplify
        const options = { tolerance: 0.01, highQuality: false, mutate: true }
        const coords = turf.simplify(featureAsGeoJSON(e.feature), options).geometry.coordinates
        e.feature.getGeometry().setCoordinates(coords)
      }
      console.log('Feature ' + e.feature.getId() + ' has been created')
      flash('Feature added', 'success')
      showFeatureEdit(e.feature)
      mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature))
    })
  })
}

export function initializeSelectInteraction () {
  const selectedFeatures = new ol.Collection()
  selectEditInteraction = new ol.interaction.Select({
    features: selectedFeatures,
    style: sketchStyle,
    multi: false,
    hitTolerance: 10
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
}

export function initializeUndoInteraction () {
  // Undo redo interaction (https://github.com/Viglino/ol-ext/blob/master/src/interaction/UndoRedo.js)
  undoInteraction = new ol.interaction.UndoRedo()
  undoInteraction.define('changeproperties', function (args) {
    // undo
    updateProps(args.feature, args.oldProps)
    mapChannel.send_message('update_feature', featureAsGeoJSON(args.feature))
    reloadFeatureEdit(args.feature)
  }, function (args) {
    // redo
    updateProps(args.feature, args.newProps)
    mapChannel.send_message('update_feature', featureAsGeoJSON(args.feature))
    reloadFeatureEdit(args.feature)
  })
  map.addInteraction(undoInteraction)

  // feature was changed or redo was called
  undoInteraction.on('stack:add', function (e) {
    // once first change was done, show undo/redo
    document.querySelector('.button-undo').classList.remove('hidden')
    document.querySelector('.button-redo').classList.remove('hidden')
  })

  undoInteraction.on('stack:clear', function (e) {
    if (document.querySelector('.button-undo')) {
      document.querySelector('.button-undo').classList.add('hidden')
      document.querySelector('.button-redo').classList.add('hidden')
    }
  })

  undoInteraction.on('undo', function (e) {
    const feature = e.action.feature
    console.log(e.action.type)
    // undo changed/added feature -> remove from server
    if (e.action.type === 'addfeature') {
      mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
      hideFeatureEdit(feature)
    }
    // undo removed feature -> add to server
    if (e.action.type === 'removefeature') {
      mapChannel.send_message('new_feature', featureAsGeoJSON(feature))
    }
    if (e.action.type === 'changegeometry') {
      mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
      reloadFeatureEdit(feature)
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
      hideFeatureEdit(feature)
    }
    if (e.action.type === 'changegeometry') {
      mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
      reloadFeatureEdit(feature)
    }
  })

  // import { PointerMoveEvent } from 'ol/MapBrowserEventType';
  // Listen to pointer move event
  map.on(ol.MapBrowserEvent.TypePointerMoveEvent, function (evt) {
    // Check if there are multiple pointers
    const pointersCount = evt.originalEvent.touches ? evt.originalEvent.touches.length : 0
    // If multiple pointers, stop drawing
    if (pointersCount > 1) {
      drawInteraction.finishDrawing()
    }
  })
}

export function showFeatureEdit (feature) {
  if (!feature) { return }
  const detailsContainer = document.querySelector('.feature-details-edit')
  detailsContainer.dataset.featureId = feature.getId()
  detailsContainer.querySelector('.feature-details-title').innerHTML = feature.get('title') || feature.getId()
  detailsContainer.querySelector('.feature-details-desc').innerHTML = ''
  detailsContainer.querySelector('.feature-details-atts-edit textarea').value = JSON.stringify(featureAsGeoJSON(feature).properties || {})
  detailsContainer.style.display = 'block'
  detailsContainer.style.opacity = '0.9'
}

export function reloadFeatureEdit (feature) {
  const detailsContainer = document.querySelector('.feature-details-edit')
  if (detailsContainer.style.display === 'block') {
    const feature = vectorSource.getFeatureById(detailsContainer.dataset.featureId)
    showFeatureEdit(feature)
  }
}

export function hideFeatureEdit () {
  const el = document.querySelector('.feature-details-edit')
  el.style.opacity = '0'
  // remove from DOM if faded out
  setTimeout(function () { if (el.style.opacity === '0') { el.style.display = 'none' } }, 1000)
}
