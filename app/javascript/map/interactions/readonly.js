import { map, locate, vectorLayer } from 'map/map'
import * as functions from 'map/functions'
import { hoverStyle, vectorStyle } from 'map/styles'
import { isMobileDevice } from 'map/interactions'

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
        html: "<i class='las la-crosshairs'></i>",
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
      console.log('deselected ' + JSON.stringify(feature.getId()))
      hideFeatureDetails()
      feature.setStyle(vectorStyle(feature))
    })
    Array.from(selectedFeatures).forEach(function (feature) {
      console.log('selected ' + JSON.stringify(feature.getId()))
      showFeatureDetails(feature)
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
    if (isMobileDevice()) { return }
    // skip hover whe there is a modal shown
    if (document.querySelector('#map-modal').style.display === 'block') { return }

    currentlySelectedFeature = null
    map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
      if (feature.getId() === undefined) { return }
      currentlySelectedFeature = feature
      if (feature !== previouslySelectedFeature) {
        feature.setStyle(hoverStyle(feature))
        map.getTargetElement().style.cursor = 'pointer'
        showFeatureDetails(feature)
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
        hideFeatureDetails()
        map.getTargetElement().style.cursor = ''
      }
    }
    previouslySelectedFeature = currentlySelectedFeature
  })
}

export function showFeatureDetails (feature) {
  const detailsContainer = document.querySelector('.feature-details-view')
  detailsContainer.dataset.featureId = feature.getId()
  detailsContainer.querySelector('.feature-details-title').innerHTML = feature.get('title') || feature.getId()
  detailsContainer.querySelector('.feature-details-desc').innerHTML = feature.get('description') || 'no description'
  detailsContainer.querySelector('.feature-details-atts').innerHTML = ''
  if (feature.getGeometry().getType() === 'LineString') {
    detailsContainer.querySelector('.feature-details-atts').innerHTML = '<p>Length: ' +
      functions.formatLength(feature.getGeometry()) + '</p>'
  } else if (feature.getGeometry().getType() === 'Polygon') {
    detailsContainer.querySelector('.feature-details-atts').innerHTML = '<p>Area: ' +
      functions.formatArea(feature.getGeometry()) + '</p>'
  }
  detailsContainer.style.display = 'block'
  detailsContainer.style.opacity = '0.9'
}

export function hideFeatureDetails () {
  const el = document.querySelector('.feature-details-view')
  el.style.opacity = '0'
  // remove from DOM if faded out
  setTimeout(function () { if (el.style.opacity === '0') { el.style.display = 'none' } }, 1000)
}
