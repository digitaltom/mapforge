import { map, mainBar, vectorSource, featureAsGeoJSON, locate, changedFeatureQueue } from 'map/map'
import { mapChannel } from 'channels/map_channel'

var drawInteraction, pointInteraction, lineInteraction, modifyInteraction, selectInteraction
export var undoInteraction

export function initializeInteractions() {

  // Undo redo interaction (https://github.com/Viglino/ol-ext/blob/master/src/interaction/UndoRedo.js)
  undoInteraction = new ol.interaction.UndoRedo()
  map.addInteraction(undoInteraction)

  // Select interaction
  const selectedFeatures = new ol.Collection()
  selectInteraction = new ol.interaction.Select({
   features: selectedFeatures,
  })

  drawInteraction = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Polygon'
  })

  pointInteraction = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Point'
  });

  lineInteraction = new ol.interaction.Draw({
    source: vectorSource,
    type: 'LineString'
  });

  // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
  modifyInteraction = new ol.interaction.Modify({source: vectorSource})

  // Add buttons to the bar
  var editBar = new ol.control.Bar({
    group: true,
    controls: [
      new ol.control.Button({
        html: 'select',
        title: 'select...',
        className: "buttons button-select",
        handleClick: function() {
          resetInteractions()
          map.addInteraction(selectInteraction)
        }
      }),
      new ol.control.Button({
        html: 'modify',
        title: 'modify...',
        className: "buttons button-modify",
        handleClick: function() {
          resetInteractions()
          map.addInteraction(modifyInteraction)
        }
      }),
      new ol.control.Button({
        html: 'draw',
        title: 'draw...',
        handleClick: function() {
          resetInteractions()
          map.addInteraction(drawInteraction)
        }
      }),
      new ol.control.Button({
        html: 'Point',
        title: 'point...',
        handleClick: function() {
          resetInteractions()
          map.addInteraction(pointInteraction)
        }
      }),
      new ol.control.Button({
        html: 'Line',
        title: 'line...',
        handleClick: function() {
          resetInteractions()
          map.addInteraction(lineInteraction)
        }
      }),
      new ol.control.Button({
        html: 'undo',
        title: 'undo...',
        handleClick: function() {
          undoInteraction.undo()
        }
      }),
      new ol.control.Button({
        html: 'redo',
        title: 'redo...',
        handleClick: function() {
          undoInteraction.redo()
        }
      }),
      new ol.control.Button({
        html: 'locate',
        title: 'locate...',
        handleClick: function() {
          locate()
        }
      })
    ]
  })
  mainBar.addControl(editBar)

  // Popup overlay: https://viglino.github.io/ol-ext/doc/doc-pages/ol.Overlay.Popup.html
  var popup = new ol.Overlay.Popup ({
    popupClass: "", //"tooltips", "warning" "black" "default", "tips", "shadow",
    closeBox: true,
    positioning: 'auto',
    autoPan: {
      animation: { duration: 250 }
    }
  })
  map.addOverlay(popup)

  // On selected => show popup
  selectInteraction.getFeatures().on(['add'], function(e) {
    var feature = e.element;
    var content = "<div id='feature-popup-content'>test</div>"
    popup.show(feature.getGeometry().getCoordinates(), content);
    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Delete'
    deleteButton.addEventListener('click', function() {
      vectorSource.removeFeature(feature)
      popup.hide()

      mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
    })
    document.getElementById('feature-popup-content').innerHTML = ''
    document.getElementById('feature-popup-content').appendChild(deleteButton)
  })
  // hide popup on outside click
  selectInteraction.getFeatures().on(['remove'], function(e) {
    popup.hide()
  })

  undoInteraction.on('undo', function(e) {
    const feature = e.action.feature
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

  undoInteraction.on('redo', function(e) {
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

  modifyInteraction.on('modifyend', function(e) {
    // console.log('changedFeatureQueue: ' + changedFeatureQueue);
    // don't use e.features.getArray() here, because it contains all map/selected features
    while(changedFeatureQueue.length > 0) {
        var feature = changedFeatureQueue.pop()
        console.log('Feature ' + feature.getId() + ' has been modified')
        mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
    }
  });

  [drawInteraction, pointInteraction, lineInteraction].forEach(function(element) {
    element.on('drawend', function(e) {
      e.feature.setId(createFeatureId())
      console.log('Feature ' + e.feature.getId() + ' has been created')
      mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature))
    })
  })
}

function resetInteractions() {
  map.removeInteraction(drawInteraction)
  map.removeInteraction(pointInteraction)
  map.removeInteraction(lineInteraction)
  map.removeInteraction(modifyInteraction)
  map.removeInteraction(selectInteraction)
}

function createFeatureId() {
  return Math.random().toString(16).slice(2)
}
