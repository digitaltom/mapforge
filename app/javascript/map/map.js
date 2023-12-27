import { mapChannel, initializeSocket } from 'channels/map_channel'
import { vectorStyle } from 'map/styles'
import { initializeInteractions, undoInteraction } from 'map/interactions'

var defaults = { 'center': [1232651.8535029977,6353568.446631506],
                 'zoom': 12,
                 'projection': 'EPSG:3857' }

var geoJsonFormat = new ol.format.GeoJSON()

export var changedFeatureQueue = [];
export var vectorSource;
export var map;
export var raster;
export var mainBar;


class ChangeListenerVectorSource extends ol.source.Vector {
 constructor(opt_options) {
  super(opt_options)
  this.on('addfeature', function(e) {
    // collecting reference to changed features in changedFeatureQueue,
    // so we only push those to the server on modifyend
    e.feature.on('change', function(e) {
      let exists = changedFeatureQueue.some(obj => obj.getId() === e.target.getId())
      if (!exists) { changedFeatureQueue.push(e.target) }
    })
  })
 }
}

document.addEventListener("turbo:load", function(){
  if (document.getElementById('map')) {
    initializeMap()
    initializeSocket()
    initializeInteractions()
  }
})

function initializeMap() {
  changedFeatureQueue = []
  vectorSource = new ChangeListenerVectorSource({
   format: geoJsonFormat,
   loader: function(extent, resolution, projection) {
     // TODO only load visible features via bbox
     var url = '/maps/' + gon.map_id + '/features?bbox=' + extent.join(',') + ',EPSG:3857';
     fetch(url)
       .then(response => response.json())
       .then(data => {
        // console.log(JSON.stringify(data))
        let features = geoJsonFormat.readFeatures(data)
        console.log('loaded ' + features.length + ' features');
        vectorSource.addFeatures(features)
        undoInteraction.clear()
       })
      .catch(error => console.error('Error:', error));
   },
   // strategy: ol.loadingstrategy.bbox
  })

  var vector = new ol.layer.Vector({
    source: vectorSource,
    style: vectorStyle
  });

  var satellite_tiles = new ol.source.XYZ({
    attributions: ['Powered by Esri',
                   'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: true,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 23
  })
  var osm_tiles = new ol.source.OSM()

  raster = new ol.layer.Tile({
    source: satellite_tiles
  });

  map = new ol.Map({
    layers: [raster, vector],
    target: 'map',
    view: new ol.View({
      projection: defaults['projection'],
      center: defaults['center'],
      zoom: defaults['zoom'],
      constrainResolution: true
    }),
    controls: ol.control.defaults.defaults({
      zoom: true,
      attribution: true,
      rotate: false
    })
  })

  // Main control bar
  mainBar = new ol.control.Bar()
  map.addControl(mainBar)
}

export function featureAsGeoJSON(feature) {
  var geoJSON = geoJsonFormat.writeFeatureObject(feature)
  return geoJSON
}

// This method gets called from the hotwire channel
export function updateFeature(data) {
  // TODO: only create/update if visible in bbox
  let newFeature = geoJsonFormat.readFeature(data)
  let feature = vectorSource.getFeatureById(data['id'])
  if(feature && changed(feature, newFeature)) {
    console.log('updating feature ' + data['id'])
    if (data['geometry']['type'] === 'Point') {
      animateMarker(newFeature, feature.getGeometry().getCoordinates(),
        newFeature.getGeometry().getCoordinates())
    }
    feature.setGeometry(newFeature.getGeometry())
    feature.setProperties(newFeature.getProperties())
    feature.changed()
  } else {
    // addFeature will not add if id already exists
    vectorSource.addFeature(newFeature);
  }
  // drop from changedFeatureQueue, it's coming from server
  arrayRemove(changedFeatureQueue, newFeature)
}

export function deleteFeature(data) {
  // TODO: only delete if visible in bbox
  let feature = vectorSource.getFeatureById(data['id'])
  if(feature) {
    console.log('deleting feature ' + data['id'])
  }
}

function changed(feature, newFeature) {
  var changed_coords = (JSON.stringify(feature.getGeometry().getCoordinates()) !== JSON.stringify(newFeature.getGeometry().getCoordinates()))
  var changed_props =  (JSON.stringify(feature.getGeometry().getProperties()) !== JSON.stringify(newFeature.getGeometry().getProperties()))
  return (changed_coords || changed_props)
}

function animateMarker(feature, start, end) {
  console.log('Animating ' + feature.getId() + ' from ' + JSON.stringify(start) + ' to ' + JSON.stringify(end))
  const startTime = Date.now();
  const listenerKey = raster.on('postrender', animate);

  const duration = 300;
  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - startTime;
    if (elapsed >= duration) {
      ol.Observable.unByKey(listenerKey);
      return;
    }
   const elapsedRatio = elapsed / duration;
   const currentCoordinate = [
     start[0] + elapsedRatio * (end[0] - start[0]),
     start[1] + elapsedRatio * (end[1] - start[1]),
   ];
     feature.getGeometry().setCoordinates(currentCoordinate);
     map.render();
   }
}

export function locate() {
  if(!navigator.geolocation) {
      flash('Your browser doesn\'t support geolocation', 'info')
  } else {
      flash('Detecting your geolocation', 'info')
      navigator.geolocation.getCurrentPosition(function(position) {
       var coordinates = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]);
       flash('Location set to: ' + coordinates, 'success')
       map.getView().setCenter(coordinates);
      })
  }
}

function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    })
}

export function flash(message, type='info', timeout=3000) {
  var flash_container = document.getElementById('flash-container').cloneNode(true)
  const flash_message = document.createElement('div')
  flash_message.classList.add('flash-message', type)
  flash_message.innerHTML = message
  flash_container.appendChild(flash_message)
  document.getElementById('flash').appendChild(flash_container)
  flash_container.style.opacity = '1'
  flash_container.style.bottom = '0.5em';
  setTimeout(function() {
    flash_container.style.opacity = '0'
    flash_container.style.bottom = '-1em';
  }, timeout)
  setTimeout(function() {
    flash_container.remove()
  }, timeout + 500) // Delete message after animation is done
}
