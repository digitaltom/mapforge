import ol from 'openlayers'
import { mapChannel } from 'channels/map_channel'


var projection = 'EPSG:3857'
var geoJsonFormat = new ol.format.GeoJSON();

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

var vectorSource = new ol.source.Vector({
 format: geoJsonFormat,
 loader: function(extent, resolution, projection) {
   // TODO only load visible features via bbox
   var url = '/maps/' + gon.map_id + '/features?bbox=' + extent.join(',') + ',EPSG:3857';
   fetch(url)
     .then(response => response.json())
     .then(data => {
      // console.log(JSON.stringify(data))
      let features = geoJsonFormat.readFeatures(data)
      vectorSource.addFeatures(features);
     })
    .catch(error => console.error('Error:', error));
 },
 strategy: ol.loadingstrategy.bbox
});

var vector = new ol.layer.Vector({
  source: vectorSource
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
  source: vectorSource,
  type: 'Polygon'
});

var point = new ol.interaction.Draw({
  source: vectorSource,
  type: 'Point'
});

var modify = new ol.interaction.Modify({source: vectorSource});
var changes = [];



document.getElementById('draw').addEventListener('click', function() {
  map.removeInteraction(modify);
  map.removeInteraction(point);
  map.addInteraction(draw);
});

document.getElementById('point').addEventListener('click', function() {
  map.removeInteraction(modify);
  map.removeInteraction(draw);
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
      vectorSource.removeFeature(lastChange.feature);
    } else if (lastChange.type === 'modify') {
      lastChange.features.forEach(function(changedFeature) {
        changedFeature.feature.setGeometry(changedFeature.geometry);
      });
    }
  }
});

function featureAsGeoJSON(feature) {
  var geoJSON = geoJsonFormat.writeFeatureObject(feature);
  // console.log(geoJSON);
  return geoJSON
}

export function updateFeature(data) {
  // TODO: only create/update in bbox
  let newFeature = new ol.format.GeoJSON().readFeature(data)
  let feature = vectorSource.getFeatureById(data['id']);
  if(feature) {
    console.log('updating feature ' + data['id']);
    feature.setGeometry(newFeature.getGeometry());
    feature.setProperties(newFeature.getProperties());
    feature.changed();
  } else {
    // addFeature will not add if id already exists
    vectorSource.addFeature(newFeature);
  }
}

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
