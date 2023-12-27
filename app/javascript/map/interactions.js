import { map, flash, mainBar, vectorSource, featureAsGeoJSON, locate, changedFeatureQueue } from 'map/map'
import { mapChannel } from 'channels/map_channel'
import { hoverStyle, vectorStyle } from 'map/styles'

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
   style: hoverStyle
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
  });

  lineInteraction = new ol.interaction.Draw({
    source: vectorSource,
    style: hoverStyle,
    type: 'LineString'
  });

  // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
  modifyInteraction = new ol.interaction.Modify({ source: vectorSource,
                                                  style: hoverStyle,
                                                  pixelTolerance: 5 })

  // Control bar: https://viglino.github.io/ol-ext/doc/doc-pages/ol.control.Bar.html
  var editBar = new ol.control.Bar({
    group: true,
    toggleOne: true,
    controls: [
      new ol.control.Button({
        html: "<i class='las la-mouse-pointer'></i>",
        title: 'Select',
        className: "buttons button-select active",
        handleClick: function() {
          resetInteractions()
          document.getElementsByClassName('button-select')[0].classList.add("active")
          map.addInteraction(selectInteraction)
        }
      }),
      new ol.control.Button({
        html: "<i class='lar la-edit'></i>",
        title: 'modify...',
        className: "buttons button-modify",
        handleClick: function() {
          resetInteractions()
          document.getElementsByClassName('button-modify')[0].classList.add("active")
          map.addInteraction(modifyInteraction)
          flash('Select a feature on your map to move it or change its shape')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-map-marker'></i>",
        title: 'Add map marker',
        className: "buttons button-marker",
        handleClick: function() {
          resetInteractions()
          document.getElementsByClassName('button-marker')[0].classList.add("active")
          map.addInteraction(pointInteraction)
          flash('Click on a location to place a marker')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-pencil-alt'></i>",
        title: 'Add a line to the map',
        className: "buttons button-line",
        handleClick: function() {
          resetInteractions()
          document.getElementsByClassName('button-line')[0].classList.add("active")
          map.addInteraction(lineInteraction)
          flash('Click on a location to start drawing a line')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-draw-polygon'></i>",
        title: 'Add a polygon to the map',
        className: "buttons button-polygon",
        handleClick: function() {
          resetInteractions()
          document.getElementsByClassName('button-polygon')[0].classList.add("active")
          map.addInteraction(drawInteraction)
          flash('Click on a location on your map to start marking an area')
        }
      })
    ]
  })
  mainBar.addControl(editBar)

  var undoBar = new ol.control.Bar({
    group: true,
    controls: [
      new ol.control.Button({
        html: "<i class='las la-undo-alt'></i>",
        title: 'Undo last change',
        className: "button-undo hidden",
        handleClick: function() {
          undoInteraction.undo()
          document.getElementsByClassName('button-redo')[0].classList.remove("hidden")
          console.log(undoInteraction.length())
          if (undoInteraction.length() === 0) {
            document.getElementsByClassName('button-undo')[0].classList.add("hidden")
          }
          flash('Reverted one change', 'success')
        }
      }),
      new ol.control.Button({
        html: "<i class='las la-redo-alt'></i>",
        title: 'Redo last change',
        className: "button-redo hidden",
        handleClick: function() {
          undoInteraction.redo()
          if (undoInteraction.length('redo') === 0) { document.getElementsByClassName('button-redo')[0].classList.add("hidden")}
          document.getElementsByClassName('button-undo')[0].classList.remove("hidden")
          flash('Re-applied one change', 'success')
        }
      })
    ]
  })
  mainBar.addControl(undoBar)

  var mapNavBar = new ol.control.Bar({
    group: true,
    position: 'left',
    controls: [
      new ol.control.Button({
        html: "<i class='las la-location-arrow'></i>",
        title: 'Center at your current location',
        handleClick: function() {
          locate()
        }
      })
    ]
  })
  map.addControl(mapNavBar)
  mapNavBar.setPosition('top-left')

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
        document.getElementsByClassName('button-undo')[0].classList.remove("hidden")
        flash('Feature updated', 'success')
    }
  });

  [drawInteraction, pointInteraction, lineInteraction].forEach(function(element) {
    element.on('drawend', function(e) {
      e.feature.setId(createFeatureId())
      console.log('Feature ' + e.feature.getId() + ' has been created')
      flash('Feature added', 'success')
      mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature))
      document.getElementsByClassName('button-undo')[0].classList.remove("hidden")
    })
  })

  let previouslySelectedFeature = null;
  let currentlySelectedFeature = null;

  map.on('pointermove', function (event) {
    currentlySelectedFeature = null
    map.forEachFeatureAtPixel(event.pixel, function (feature) {
      currentlySelectedFeature = feature
    if (previouslySelectedFeature == null ||
      feature.getId() !== previouslySelectedFeature.getId()) {
      feature.setStyle(hoverStyle(feature))
      showFeatureDetails(feature)
    }
    return true;
   }, {
    hitTolerance: 5 // Tolerance in pixels
   })

    // reset feature style if no more highlighted
    // if (previouslySelectedFeature && currentlySelectedFeature == null) {
    //   hideFeatureDetails(previouslySelectedFeature)
    // }

    if (previouslySelectedFeature &&
        (currentlySelectedFeature == null ||
          currentlySelectedFeature.getId() !== previouslySelectedFeature.getId())) {
      previouslySelectedFeature.setStyle(vectorStyle(previouslySelectedFeature))
    }
    previouslySelectedFeature = currentlySelectedFeature
  })

}

function showFeatureDetails(feature) {
  var details_container = document.getElementById('feature-details')
  details_container.innerHTML = feature.getId()
  const deleteButton = document.createElement('button')
  deleteButton.textContent = 'Delete'
  deleteButton.addEventListener('click', function() {
    vectorSource.removeFeature(feature)
    hideFeatureDetails(feature)
    mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
    flash('Feature deleted', 'success')
    document.getElementsByClassName('button-undo')[0].classList.remove("hidden")
  })
  details_container.appendChild(deleteButton)
  details_container.style.opacity = '1'
}

function hideFeatureDetails(feature) {
  var details_container = document.getElementById('feature-details')
  details_container.style.opacity = '0'
}


function resetInteractions() {
  map.removeInteraction(drawInteraction)
  map.removeInteraction(pointInteraction)
  map.removeInteraction(lineInteraction)
  map.removeInteraction(modifyInteraction)
  map.removeInteraction(selectInteraction)
  Array.from(document.getElementsByClassName('buttons')).forEach(function(button) {
      button.classList.remove("active")
  })
}

function createFeatureId() {
  return Math.random().toString(16).slice(2)
}
