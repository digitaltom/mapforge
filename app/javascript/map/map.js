import ol from 'openlayers'
import { mapChannel } from 'channels/map_channel'


var defaults = { 'center': [1232651.8535029977,6353568.446631506],
                 'zoom': 12,
                 'projection': 'EPSG:3857' }

var geoJsonFormat = new ol.format.GeoJSON();

export var changes = [];
export var vectorSource;
export var map;

var raster = new ol.layer.Tile({
  source: new ol.source.OSM()
});

vectorSource = new ol.source.Vector({
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

map = new ol.Map({
  layers: [raster, vector],
  target: 'map',
  view: new ol.View({
    projection: defaults['projection'],
    center: defaults['center'],
    zoom: defaults['zoom'],
    constrainResolution: true
  })
})

export function featureAsGeoJSON(feature) {
  var geoJSON = geoJsonFormat.writeFeatureObject(feature);
  return geoJSON
}

export function updateFeature(data) {
  // TODO: only create/update if visible in bbox
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

export function locate() {
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
}
