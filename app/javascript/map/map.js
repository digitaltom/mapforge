import { initializeSocket } from 'channels/map_channel'
import { vectorStyle } from 'map/styles'
import { initializeInteractions, undoInteraction, hideFeatureDetails } from 'map/interactions'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

const defaults = {
  center: [1232651.8535029977, 6353568.446631506],
  zoom: 12,
  projection: 'EPSG:3857'
}

const geoJsonFormat = new ol.format.GeoJSON()

export let changedFeatureQueue = []
export let vectorSource, fixedSource
export let map
export let rasterLayer
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

  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: vectorStyle
  })

  // layer for immutable features, like location
  fixedSource = new ol.source.Vector({ features: [] })
  const fixedLayer = new ol.layer.Vector({
    source: fixedSource,
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

  rasterLayer = new ol.layer.Tile({
    source: satelliteTiles
  })

  map = new ol.Map({
    layers: [rasterLayer, vectorLayer, fixedLayer],
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
export function updateFeature (data, source = vectorSource) {
  // TODO: only create/update if visible in bbox
  const newFeature = geoJsonFormat.readFeature(data)
  const feature = source.getFeatureById(data.id)
  if (feature && changed(feature, newFeature)) {
    console.log('updating feature ' + data.id)
    if (data.geometry.type === 'Point' && changedCoords(feature, newFeature)) {
      animateMarker(newFeature, feature.getGeometry().getCoordinates(),
        newFeature.getGeometry().getCoordinates())
    }
    feature.setGeometry(newFeature.getGeometry())
    feature.setProperties(newFeature.getProperties())
    feature.changed()
  } else {
    // addFeature will not add if id already exists
    source.addFeature(newFeature)
  }
  // drop from changedFeatureQueue, it's coming from server
  arrayRemove(changedFeatureQueue, newFeature)
}

export function deleteFeature (id) {
  const feature = vectorSource.getFeatureById(id)
  if (feature) {
    console.log('deleting feature ' + id)
    vectorSource.removeFeature(feature)
    hideFeatureDetails()
  }
}

function changed (feature, newFeature) {
  return (changedCoords(feature, newFeature) || changedProps(feature, newFeature))
}

function changedCoords (feature, newFeature) {
  return (JSON.stringify(feature.getGeometry().getCoordinates()) !== JSON.stringify(newFeature.getGeometry().getCoordinates()))
}

function changedProps (feature, newFeature) {
  return (JSON.stringify(feature.getProperties()) !== JSON.stringify(newFeature.getProperties()))
}

function animateMarker (feature, start, end) {
  console.log('Animating ' + feature.getId() + ' from ' + JSON.stringify(start) + ' to ' + JSON.stringify(end))
  const startTime = Date.now()
  const listenerKey = rasterLayer.on('postrender', animate)

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
  console.log('Getting geolocation')
  if (!navigator.geolocation) {
    flash('Your browser doesn\'t support geolocation', 'info')
  } else {
    const locationFeature = fixedSource.getFeatureById('location')
    if (!locationFeature) { flash('Detecting your geolocation', 'info') }
    navigator.geolocation.getCurrentPosition(function (position) {
      const coordinates = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude])
      // only flash + animate on first locate
      if (!locationFeature) {
        flash('Location set to: ' + coordinates, 'success')
        animateMapCenterTo(coordinates)
      }
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(coordinates),
        title: 'You',
        description: 'You\'re currently detected position',
        'marker-color': '#f00'
      })
      feature.setId('location')
      const data = featureAsGeoJSON(feature)
      updateFeature(data, fixedSource)
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

function animateMapCenterTo (coords) {
  const animationOptions = {
    center: coords,
    duration: 1000, // in ms
    easing: ol.easing.easeIn
  }
  map.getView().animate(animationOptions)
}
