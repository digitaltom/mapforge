import { vectorStyle } from 'map/styles'
import { hideFeatureDetails } from 'map/interactions/readonly'
import { undoInteraction } from 'map/interactions/edit'
import { mapProperties } from 'map/properties'
import { FPSControl } from 'map/controls/fps'
import { animateMarker, animateView } from 'map/animations'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

const geoJsonFormat = new ol.format.GeoJSON({
  // dataProjection: 'EPSG:4326', // server stores [11.077, 49.447]
  // featureProjection: 'EPSG:3857' // map uses [1232651.8535, 6353568.4466]
})

export let changedFeatureQueue = []
export let vectorSource, vectorLayer, fixedSource
export let map
export let mainBar

class ChangeListenerVectorSource extends ol.source.Vector {
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
  const el = document.getElementById('banner-overlay').cloneNode(true)
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
          if (undoInteraction) { undoInteraction.clear() }
        })
        .catch(error => console.error('Error:', error))
    }
    // strategy: ol.loadingstrategy.bbox
  })

  vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: vectorStyle
  })

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

  if (map) { map.dispose() }
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

  if (window.gon.map_mode === 'rw') { map.addControl(new FPSControl()) }

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

  // re-render features that have a resolution/zoomlevel dependent style
  map.getView().on('change:resolution', function () {
    vectorSource.getFeatures().forEach((feature) => {
      if (feature.get('title-min-zoom')) { feature.setStyle(vectorStyle(feature)) }
      if (feature.get('banner')) { showBanner(feature) }
    })
  })
}

export function featureAsGeoJSON (feature) {
  const geoJSON = geoJsonFormat.writeFeatureObject(feature)
  return geoJSON
}

// This method gets called from local updates + the hotwire channel
export function updateFeature (data, source = vectorSource) {
  // TODO: only create/update if visible in bbox
  const newFeature = geoJsonFormat.readFeature(data)
  const feature = source.getFeatureById(data.id)
  if (feature && changed(feature, newFeature)) {
    console.log("updating changed feature '" + data.id + "'")
    if (data.geometry.type === 'Point' && changedCoords(feature, newFeature)) {
      animateMarker(newFeature, feature.getGeometry().getCoordinates(),
        newFeature.getGeometry().getCoordinates())
    }
    feature.setGeometry(newFeature.getGeometry())
    updateProps(feature, newFeature.getProperties())
    feature.setStyle(vectorStyle(feature))
    feature.changed()
  } else {
    // addFeature will not add if id already exists
    source.addFeature(newFeature)
  }
  vectorSource.changed()
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
  const oldCoords = JSON.stringify(feature.getGeometry().getCoordinates())
  const newCoords = JSON.stringify(newFeature.getGeometry().getCoordinates())
  const changed = (oldCoords !== newCoords)
  if (changed) { console.log('changed coords: ' + oldCoords + ' -> ' + newCoords) }
  return changed
}

function changedProps (feature, newFeature) {
  const oldProps = JSON.stringify(featureAsGeoJSON(feature).properties)
  const newProps = JSON.stringify(featureAsGeoJSON(newFeature).properties)
  const changed = (oldProps !== newProps)
  if (changed) { console.log('changed props: ' + oldProps + ' -> ' + newProps) }
  return changed
}

// https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html
// needed because setProperties() only updates, and does not drop...
export function updateProps (feature, newProps) {
  const oldProps = featureAsGeoJSON(feature).properties
  for (const key in oldProps) {
    // drop existing key if not included in newProps
    if (!newProps[key]) { feature.unset(key) }
  }
  feature.setProperties(newProps)
  feature.setStyle(vectorStyle(feature))
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
