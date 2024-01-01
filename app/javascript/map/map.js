import { initializeSocket } from 'channels/map_channel'
import { vectorStyle } from 'map/styles'
import { initializeInteractions, undoInteraction } from 'map/interactions'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

const defaults = {
  center: [1232651.8535029977, 6353568.446631506],
  zoom: 12,
  projection: 'EPSG:3857'
}

const geoJsonFormat = new ol.format.GeoJSON()

export let changedFeatureQueue = []
export let vectorSource
export let map
export let raster
export let mainBar

class ChangeListenerVectorSource extends ol.source.Vector {
  constructor (optOptions) {
    super(optOptions)
    this.on('addfeature', function (e) {
    // collecting reference to changed features in changedFeatureQueue,
    // so we only push those to the server on modifyend
      e.feature.on('change', function (e) {
        const exists = changedFeatureQueue.some(obj => obj.getId() === e.target.getId())
        if (!exists) { changedFeatureQueue.push(e.target) }
      })
    })
  }
}

document.addEventListener('turbo:load', function () {
  if (document.getElementById('map')) {
    initializeMap()
    initializeSocket()
    initializeInteractions()
  }
})

function initializeMap () {
  changedFeatureQueue = []
  vectorSource = new ChangeListenerVectorSource({
    format: geoJsonFormat,
    loader: function (extent, resolution, projection) {
      // TODO only load visible features via bbox
      const url = '/maps/' + window.gon.map_id + '/features?bbox=' + extent.join(',') + ',EPSG:3857'
      fetch(url)
        .then(response => response.json())
        .then(data => {
        // console.log(JSON.stringify(data))
          const features = geoJsonFormat.readFeatures(data)
          console.log('loaded ' + features.length + ' features')
          vectorSource.addFeatures(features)
          undoInteraction.clear()
        })
        .catch(error => console.error('Error:', error))
    }
    // strategy: ol.loadingstrategy.bbox
  })

  const vector = new ol.layer.Vector({
    source: vectorSource,
    style: vectorStyle
  })

  const satelliteTiles = new ol.source.XYZ({
    attributions: ['Powered by Esri',
      'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'],
    attributionsCollapsible: true,
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 23
  })
  const osmTiles = new ol.source.OSM() // eslint-disable-line no-unused-vars

  raster = new ol.layer.Tile({
    source: satelliteTiles
  })

  map = new ol.Map({
    layers: [raster, vector],
    target: 'map',
    view: new ol.View({
      projection: defaults.projection,
      center: defaults.center,
      zoom: defaults.zoom,
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

export function featureAsGeoJSON (feature) {
  const geoJSON = geoJsonFormat.writeFeatureObject(feature)
  return geoJSON
}

// This method gets called from the hotwire channel
export function updateFeature (data) {
  // TODO: only create/update if visible in bbox
  const newFeature = geoJsonFormat.readFeature(data)
  const feature = vectorSource.getFeatureById(data.id)
  if (feature && changed(feature, newFeature)) {
    console.log('updating feature ' + data.id)
    if (data.geometry.type === 'Point') {
      animateMarker(newFeature, feature.getGeometry().getCoordinates(),
        newFeature.getGeometry().getCoordinates())
    }
    feature.setGeometry(newFeature.getGeometry())
    feature.setProperties(newFeature.getProperties())
    feature.changed()
  } else {
    // addFeature will not add if id already exists
    vectorSource.addFeature(newFeature)
  }
  // drop from changedFeatureQueue, it's coming from server
  arrayRemove(changedFeatureQueue, newFeature)
}

export function deleteFeature (data) {
  // TODO: only delete if visible in bbox
  const feature = vectorSource.getFeatureById(data.id)
  if (feature) {
    console.log('deleting feature ' + data.id)
  }
}

function changed (feature, newFeature) {
  const changedCoords = (JSON.stringify(feature.getGeometry().getCoordinates()) !== JSON.stringify(newFeature.getGeometry().getCoordinates()))
  const changedProps = (JSON.stringify(feature.getProperties()) !== JSON.stringify(newFeature.getProperties()))
  return (changedCoords || changedProps)
}

function animateMarker (feature, start, end) {
  console.log('Animating ' + feature.getId() + ' from ' + JSON.stringify(start) + ' to ' + JSON.stringify(end))
  const startTime = Date.now()
  const listenerKey = raster.on('postrender', animate)

  const duration = 300
  function animate (event) {
    const frameState = event.frameState
    const elapsed = frameState.time - startTime
    if (elapsed >= duration) {
      ol.Observable.unByKey(listenerKey)
      return
    }
    const elapsedRatio = elapsed / duration
    const currentCoordinate = [
      start[0] + elapsedRatio * (end[0] - start[0]),
      start[1] + elapsedRatio * (end[1] - start[1])
    ]
    feature.getGeometry().setCoordinates(currentCoordinate)
    map.render()
  }
}

export function locate () {
  if (!navigator.geolocation) {
    flash('Your browser doesn\'t support geolocation', 'info')
  } else {
    flash('Detecting your geolocation', 'info')
    navigator.geolocation.getCurrentPosition(function (position) {
      const coordinates = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude])
      flash('Location set to: ' + coordinates, 'success')
      map.getView().setCenter(coordinates)
    })
  }
}

function arrayRemove (arr, value) {
  return arr.filter(function (ele) {
    return ele !== value
  })
}

export function flash (message, type = 'info', timeout = 3000) {
  if (!document.getElementById('flash-container')) { return false }
  const flashContainer = document.getElementById('flash-container').cloneNode(true)
  const flashMessage = document.createElement('div')
  flashMessage.classList.add('flash-message', type)
  flashMessage.innerHTML = message
  flashContainer.appendChild(flashMessage)
  document.getElementById('flash').appendChild(flashContainer)
  flashContainer.style.opacity = '1'
  flashContainer.style.bottom = '0.5em'
  setTimeout(function () {
    flashContainer.style.opacity = '0'
    flashContainer.style.bottom = '-1em'
  }, timeout)
  setTimeout(function () {
    flashContainer.remove()
  }, timeout + 500) // Delete message after animation is done
}
