import { map, mainBar, vectorSource, changes, featureAsGeoJSON, locate, changedFeatureQueue } from 'map/map'
import { mapChannel } from 'channels/map_channel'

var draw, point, line, modify

export function initializeInteractions() {

  // Undo redo interaction (https://github.com/Viglino/ol-ext/blob/master/src/interaction/UndoRedo.js)
  var undoInteraction = new ol.interaction.UndoRedo()
  map.addInteraction(undoInteraction)

  // Select interaction
  const selectedFeatures = new ol.Collection()
  const selectInteraction = new ol.interaction.Select({
   features: selectedFeatures,
  })

  selectedFeatures.on('add', function(event) {
   const feature = event.element;
   const source = feature.get('source');
   const deleteButton = document.createElement('button');
   deleteButton.textContent = 'Delete';
   deleteButton.addEventListener('click', function() {
     vectorSource.removeFeature(feature)
     mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
   });
   console.log('selected ' + feature)
   document.getElementById('buttons').appendChild(deleteButton)
  });

  selectedFeatures.on('remove', function(event) {
   const feature = event.element;
   // Remove the delete button for the feature
  });

  undoInteraction.on('undo', function(e) {
    console.log(e)
    const feature = e.action.feature
    // undo changed/added feature -> remove from server
    if (e.action.type === 'addfeature') {
      mapChannel.send_message('delete_feature', featureAsGeoJSON(feature))
    }
    // undo removed feature -> add to server

  })

  undoInteraction.on('redo', function(e) {
    console.log(e)
   const feature = e.action.feature
    // redo changed/added feature -> add to server
    if (e.action.type === 'addfeature') {
      mapChannel.send_message('update_feature', featureAsGeoJSON(feature))
    }
    // redo removed feature -> remove from server


  })

  // Handle undo/redo stack
  undoInteraction.on('stack:add', function (e) {
  });
  // Append to redo stack
  undoInteraction.on('stack:remove', function (e) {
  });
  // Clear stack
  undoInteraction.on('stack:clear', function (e) {
  });

  // Add buttons to the bar
  var bar = new ol.control.Bar({
    group: true,
    controls: [
      new ol.control.Button({
        html: 'select',
        title: 'select...',
        handleClick: function() {
          map.addInteraction(selectInteraction)
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
      })
    ]
  })
  mainBar.addControl(bar)




  draw = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Polygon'
  });

  point = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Point'
  });

  line = new ol.interaction.Draw({
    source: vectorSource,
    type: 'LineString'
  });

  // https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
  modify = new ol.interaction.Modify({source: vectorSource});

  document.getElementById('draw').addEventListener('click', function() {
    resetInteractions()
    map.addInteraction(draw);
  });

  document.getElementById('point').addEventListener('click', function() {
    resetInteractions()
    map.addInteraction(point);
  });

  document.getElementById('line').addEventListener('click', function() {
    resetInteractions()
    map.addInteraction(line);
  });

  document.getElementById('modify').addEventListener('click', function() {
    resetInteractions()
    map.addInteraction(modify);
  });

  document.getElementById('locate').addEventListener('click', function() {
    locate();
  });

  document.getElementById('undo').addEventListener('click', function() {
    if (changes.length > 0) {
      var lastChange = changes.pop()
      if (lastChange.type === 'add') {
        vectorSource.removeFeature(lastChange.feature)
      } else if (lastChange.type === 'modify') {
        lastChange.features.forEach(function(changedFeature) {
          changedFeature.feature.setGeometry(changedFeature.geometry)
        })
      }
    }
  })

  modify.on(['modifystart'], function(e) {
    // TODO: find way to only store modified feature
    changes.push({
      type: 'modify',
      features: e.features.getArray().map(function(feature) {
        return {
          feature: feature,
          geometry: feature.getGeometry().clone()
        };
      })
    });
  });

  modify.on('modifyend', function(e) {
    // console.log('changedFeatureQueue: ' + changedFeatureQueue);
    // don't use e.features.getArray() here, because it contains all map/selected features
    while(changedFeatureQueue.length > 0) {
        var feature = changedFeatureQueue.pop()
        console.log('Feature ' + feature.getId() + ' has been modified');
        mapChannel.send_message('update_feature', featureAsGeoJSON(feature));
    }
  });

  [draw, point, line].forEach(function(element) {
    element.on('drawend', function(e) {
      e.feature.setId(createFeatureId());
      console.log('Feature ' + e.feature.getId() + ' has been created');
      changes.push({
        type: 'add',
        feature: e.feature
      });
      mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature));
    });
  })
}

function resetInteractions() {
  map.removeInteraction(draw)
  map.removeInteraction(point)
  map.removeInteraction(line)
  map.removeInteraction(modify)
}

function createFeatureId() {
  return Math.random().toString(16).slice(2)
}
