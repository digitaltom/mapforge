import { vectorStyle } from 'map/styles'
import { undoInteraction } from 'map/interactions/edit'
import { mapProperties } from 'map/properties'
import { animateView } from 'map/animations'
import * as dom from 'helpers/dom'
import { backgroundTiles } from 'map/layers/background_maps'
import { geoJsonFormat, featureAsGeoJSON, updateFeature } from 'map/feature'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

export let changedFeatureQueue = []
export let vectorSource, vectorLayer, fixedSource
export let olMapLayer
export let map
export let mainBar

export class ChangeListenerVectorSource extends ol.source.Vector {
  constructor (optOptions) {
    super(optOptions)
    this.on('addfeature', function (e) {
      // pre-compute the style and store it on the feature
      e.feature.setStyle(vectorStyle(e.feature))
      if (e.feature.get('banner')) { showBanner(e.feature) }

      // collecting reference to changed features in changedFeatureQueue,
      // so we only push those to the server on modifyend
      e.feature.on('change', function (e) {
        const exists = changedFeatureQueue.some(obj => obj.getId() === e.target.getId())
        if (!exists) { changedFeatureQueue.push(e.target) }
        if (e.target.get('banner')) { showBanner(e.target) }
      })
    })
  }
}

// Create a banner overlay with the element
// https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html
function showBanner (feature) {
  map.removeOverlay(feature.overlay)
  const el = document.querySelector('.banner-overlay').cloneNode(true)
  el.innerHTML = feature.get('banner')
  const zoom = map.getView().getZoom()
  const scaleFactor = (zoom / 10) ** 8
  el.style.transform = `scale(${scaleFactor})`
  feature.overlay = new ol.Overlay({
    element: el,
    positioning: 'center-center',
    stopEvent: false,
    offset: [0, 0]
  })

  const featureCoordinates = ol.extent.getCenter(feature.getGeometry().getExtent())
  feature.overlay.setPosition(featureCoordinates)
  map.addOverlay(feature.overlay)
}

export function initializeMap (divId = 'map') {
  changedFeatureQueue = []
  if (map) { disposeMap() }

  // TODO only load visible features via bbox
  const url = '/maps/' + window.gon.map_id + '/features'
  vectorSource = vectorSourceFromUrl(url)
  vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: vectorStyle
  })
  window.vectorLayer = vectorLayer

  // layer for immutable features, like location
  fixedSource = new ol.source.Vector({ features: [] })
  const fixedLayer = new ol.layer.Vector({
    source: fixedSource,
    style: vectorStyle
  })

  const controls = ol.control.defaults.defaults({
    zoom: window.gon.map_mode !== 'static',
    attribution: true,
    rotate: false
  })

  map = new ol.Map({
    layers: [vectorLayer, fixedLayer],
    target: divId,
    renderer: 'webgl',
    view: new ol.View({
      projection: mapProperties.projection,
      center: ol.proj.fromLonLat(mapProperties.center),
      zoom: mapProperties.zoom,
      constrainResolution: true
    }),
    controls,
    keyboardEventTarget: document
  })

  // Main control bar
  mainBar = new ol.control.Bar({ className: 'main-bar' })
  map.addControl(mainBar)
  // add current map view to url
  // map.addInteraction(new ol.interaction.Link())
  // allow double tap/click then drag up/down to zoom
  map.addInteraction(new ol.interaction.DblClickDragZoom())
  // snap in on feature changes
  map.addInteraction(new ol.interaction.Snap({ source: vectorSource, pixelTolerance: 10 }))

  const scaleLineMetric = new ol.control.ScaleLine({
    units: ['metric'],
    target: document.getElementById('scaleline-metric')
  })
  if (window.gon.map_mode !== 'static') { map.addControl(scaleLineMetric) }

  map.getView().on('change:resolution', function () {
    // re-render features that have a resolution/zoomlevel dependent style
    vectorSource.getFeatures().forEach((feature) => {
      if (feature.get('title-min-zoom')) { feature.setStyle(vectorStyle(feature)) }
      if (feature.get('banner')) { showBanner(feature) }
    })
  })
}

function disposeMap () {
  map.getLayers().getArray().slice().forEach(layer => map.removeLayer(layer))
  map.getOverlays().getArray().slice().forEach(overlay => map.removeOverlay(overlay))
  map.getControls().getArray().slice().forEach(control => map.removeControl(control))
  map.setTarget(null)
  map = null
  backgroundMapLayerName = null
  document.querySelector('.map').innerHTML = ''
}

export function locate () {
  console.log('Getting geolocation')
  if (!navigator.geolocation) {
    flash('Your browser doesn\'t support geolocation', 'info')
  } else {
    const locationFeature = fixedSource.getFeatureById('location')
    if (!locationFeature) { flash('Detecting your geolocation', 'info') }
    navigator.geolocation.getCurrentPosition(function (position) {
      const coordinates = [position.coords.longitude, position.coords.latitude]
      // const accuracy = circular(coords, position.coords.accuracy)

      // only flash + animate on first locate
      if (!locationFeature) {
        flash('Location set to: ' + ol.proj.fromLonLat(coordinates), 'success')
        animateView(ol.proj.fromLonLat(coordinates))
      }
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
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

export function vectorSourceFromUrl (url) {
  const vectorSource = new ChangeListenerVectorSource({
    format: geoJsonFormat,
    loader: function (extent, resolution, projection) {
      url += '?bbox=' + extent.join(',') + ',EPSG:3857'
      fetch(url)
        .then(response => response.json())
        .then(data => {
          // console.log(JSON.stringify(data))
          const features = geoJsonFormat.readFeatures(data)
          console.log('loaded ' + features.length + ' geojson features from ' + url)
          vectorSource.addFeatures(features)
          if (undoInteraction) { undoInteraction.clear() }
        })
        .catch(error => console.error('Error:', error))
    }
    // strategy: ol.loadingstrategy.bbox
  })
  return vectorSource
}

// name must be a valid pre-defined map from layers/background_maps
let backgroundMapLayerName
export async function setBackgroundMapLayer (name = mapProperties.base_map) {
  if (backgroundMapLayerName !== name) {
    const prevMapLayerElement = document.querySelector('.map-layer-' + backgroundMapLayerName)
    const prevMapLayer = olMapLayer
    backgroundMapLayerName = name
    console.log("Loading base map '" + name + "'")
    olMapLayer = backgroundTiles[name]()
    map.getLayers().insertAt(0, olMapLayer)

    // fade out previous map
    if (prevMapLayerElement) {
      prevMapLayerElement.style.opacity = 0
      setTimeout(function () { map.removeLayer(prevMapLayer) }, 1400)
    }
  }
  // fade in map
  dom.waitForElement('.map-layer-' + name, function changeOpacity (el) {
    el.style.opacity = 1
  })
}
