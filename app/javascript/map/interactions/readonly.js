import { map, locate, vectorLayer } from 'map/map'
import * as functions from 'helpers/functions'
import { hoverStyle, vectorStyle } from 'map/styles'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export let selectInteraction
let locationIntervall

export function initializeReadonlyInteractions () {
  const selectedFeatures = new ol.Collection()
  selectInteraction = new ol.interaction.Select({
    features: selectedFeatures,
    style: hoverStyle,
    multi: false,
    hitTolerance: 10
  })

  map.addInteraction(selectInteraction)

  const mapNavBar = new ol.control.Bar({
    group: false,
    controls: [
      new ol.control.Button({
        html: "<i class='bi-crosshair'></i>",
        title: 'Center at your current location',
        className: 'button button-locate',
        handleClick: function () {
          if (!locationIntervall) {
            document.querySelector('.button-locate').classList.add('active')
            locate()
            locationIntervall = setInterval(locate, 10000)
          } else {
            document.querySelector('.button-locate').classList.remove('active')
            clearInterval(locationIntervall)
            locationIntervall = null
          }
        }
      })
    ]
  })
  map.addControl(mapNavBar)
  mapNavBar.setPosition('right-top')

  selectInteraction.on('select', function (e) {
    const selectedFeatures = e.selected
    const deselectedFeatures = e.deselected
    Array.from(deselectedFeatures).forEach(function (feature) {
      // console.log('deselected ' + JSON.stringify(feature.getId()))
      hideFeaturePopup()
      feature.setStyle(vectorStyle(feature))
    })
    Array.from(selectedFeatures).forEach(function (feature) {
      // console.log('selected ' + JSON.stringify(feature.getId()))
      showFeaturePopup(feature)
      feature.setStyle(hoverStyle(feature))
    })
  })

  let previouslySelectedFeature = null
  let currentlySelectedFeature = null

  map.on('pointermove', function (event) {
    // skip hover effects when not in an active selectInteraction
    if (!map.getInteractions().getArray().includes(selectInteraction)) { return }
    // skip hover effects when a feature is selected
    if (selectedFeatures.getArray().length > 0) { return }
    if (event.dragging) { return }
    if (functions.isMobileDevice()) { return }

    currentlySelectedFeature = null
    map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
      if (feature.getId() === undefined) { return }
      currentlySelectedFeature = feature
      if (feature !== previouslySelectedFeature) {
        if (feature.get('title')) {
          feature.setStyle(hoverStyle(feature))
          map.getTargetElement().style.cursor = 'pointer'
          showFeaturePopup(feature)
        }
      }
      return true
    }, {
      layerFilter: function (layer) { return layer === vectorLayer },
      hitTolerance: 10 // Tolerance in pixels
    })

    // reset style of no more hovered feature
    if (previouslySelectedFeature &&
        (currentlySelectedFeature !== previouslySelectedFeature)) {
      previouslySelectedFeature.setStyle(vectorStyle(previouslySelectedFeature))
      if (currentlySelectedFeature == null) {
        hideFeaturePopup()
        map.getTargetElement().style.cursor = ''
      }
    }
    previouslySelectedFeature = currentlySelectedFeature
  })

  const featurePopupCloser = document.querySelector('#feature-popup-closer')
  featurePopupCloser.addEventListener('click', function (event) {
    event.preventDefault()
    hideFeaturePopup()
  })
}

export function showFeaturePopup (feature) {
  const popupElement = document.getElementById('feature-popup')
  const popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: false,
    offset: [0, -10]
  })
  map.addOverlay(popup)
  const extent = feature.getGeometry().getExtent()
  popup.setPosition(ol.extent.getCenter(extent))
  popupElement.style.display = 'block'
  const titleSpan = document.getElementById('feature-popup-title')
  if (feature.get('title')) {
    titleSpan.innerHTML = feature.get('title')
  } else { titleSpan.innerHTML = 'No title' }
  const descSpan = document.getElementById('feature-popup-desc')
  if (feature.get('description')) {
    descSpan.innerHTML = feature.get('description')
  } else { descSpan.innerHTML = 'No description' }
  const sizeSpan = document.querySelector('#feature-popup-size')
  if (feature.getGeometry().getType() === 'LineString') {
    sizeSpan.innerHTML = functions.formatLength(feature.getGeometry())
  } else if (feature.getGeometry().getType() === 'Polygon') {
    sizeSpan.innerHTML = functions.formatArea(feature.getGeometry())
  } else { sizeSpan.innerHTML = '' }
  popupElement.style.opacity = '0.9'
}

export function hideFeaturePopup () {
  const popupElement = document.getElementById('feature-popup')
  popupElement.style.opacity = '0'
  // remove from DOM if faded out
  setTimeout(function () { if (popupElement.style.opacity === '0') { popupElement.style.display = 'none' } }, 1000)
}
