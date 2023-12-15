import { map, vectorSource, changes, featureAsGeoJSON, locate, changedFeatureQueue } from 'map/map'
import { mapChannel } from 'channels/map_channel'
import ol from 'openlayers'

var draw = new ol.interaction.Draw({
  source: vectorSource,
  type: 'Polygon'
});

var point = new ol.interaction.Draw({
  source: vectorSource,
  type: 'Point'
});

var line = new ol.interaction.Draw({
  source: vectorSource,
  type: 'LineString'
});

// https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html
var modify = new ol.interaction.Modify({source: vectorSource});

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
    var lastChange = changes.pop();
    if (lastChange.type === 'add') {
      vectorSource.removeFeature(lastChange.feature);
    } else if (lastChange.type === 'modify') {
      lastChange.features.forEach(function(changedFeature) {
        changedFeature.feature.setGeometry(changedFeature.geometry);
      });
    }
  }
});

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

function resetInteractions() {
  map.removeInteraction(draw)
  map.removeInteraction(point)
  map.removeInteraction(line)
  map.removeInteraction(modify)
}

function createFeatureId() {
  return Math.random().toString(16).slice(2)
}
