import { map, vectorSource, changes, featureAsGeoJSON, locate } from 'map/map'
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
  console.log('Modify start');
  changes.push({
    type: 'modify',
    features: e.features.getArray().map(function(feature) {
      console.log("Storing geometry to 'undo' stack");
      return {
        feature: feature,
        geometry: feature.getGeometry().clone()
      };
    })
  });
});

modify.on('modifyend', function(e) {
  console.log('Feature has been modified');
  e.features.getArray().map(function(feature) {
    mapChannel.send_message('update_feature', featureAsGeoJSON(feature));
  })
});

[draw, point, line].forEach(function(element) {
  element.on('drawend', function(e) {
    console.log('Feature has been created');
    e.feature.setId(createFeatureId());
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
