import ol from 'openlayers'
import { mapChannel } from 'channels/map_channel'

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

export var source = new ol.source.Vector();
var vector = new ol.layer.Vector({
  source: source
});

var map = new ol.Map({
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
    projection: 'EPSG:3857',
    center: [1232651.8535029977,6353568.446631506],
    zoom: 12,
    constrainResolution: true
  })
});

var draw = new ol.interaction.Draw({
  source: source,
  type: 'Polygon'
});

var point = new ol.interaction.Draw({
  source: source,
  type: 'Point'
});

var modify = new ol.interaction.Modify({source: source});
var changes = [];



document.getElementById('draw').addEventListener('click', function() {
  map.removeInteraction(modify);
  map.removeInteraction(point);
  map.addInteraction(draw);
});

document.getElementById('point').addEventListener('click', function() {
  map.removeInteraction(modify);
  map.removeInteraction(point);
  map.addInteraction(point);
});

document.getElementById('modify').addEventListener('click', function() {
  map.removeInteraction(draw);
  map.removeInteraction(point);
  map.addInteraction(modify);
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

draw.on('drawend', function(e) {
  console.log('Feature has been created');
  e.feature.setId(Math.random().toString(16).slice(2));
  changes.push({
    type: 'add',
    feature: e.feature
  });
  mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature));
});

point.on('drawend', function(e) {
  console.log('Point has been created');
  e.feature.setId(Math.random().toString(16).slice(2));
  changes.push({
    type: 'add',
    feature: e.feature
  });
  mapChannel.send_message('new_feature', featureAsGeoJSON(e.feature));
});


document.getElementById('undo').addEventListener('click', function() {
  if (changes.length > 0) {
    var lastChange = changes.pop();
    if (lastChange.type === 'add') {
      source.removeFeature(lastChange.feature);
    } else if (lastChange.type === 'modify') {
      lastChange.features.forEach(function(changedFeature) {
        changedFeature.feature.setGeometry(changedFeature.geometry);
      });
    }
  }
});

function featureAsGeoJSON(feature) {
  var format = new ol.format.GeoJSON();
  var geoJSON = format.writeFeatureObject(feature);
  // console.log(geoJSON);
  return geoJSON
}

export function updateFeature(data) {
  let newFeature = new ol.format.GeoJSON().readFeature(data)
  let feature = source.getFeatureById(data['id']);
  if(feature) {
    console.log('updating feature ' + data['id']);
    feature.setGeometry(newFeature.getGeometry());
    feature.setProperties(newFeature.getProperties());
    feature.changed();
  } else {
    source.addFeature(newFeature);
  }
}

export var mapId = document.getElementById('map').dataset.mapId;

if(!navigator.geolocation) {
    console.log("Your browser doesn't support geolocation")
} else {
    console.log("Detecting geolocation")
    navigator.geolocation.getCurrentPosition(function(position) {
     var coordinates = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]);
     console.log("Setting " + coordinates)
     map.getView().setCenter(coordinates);
    });
}
