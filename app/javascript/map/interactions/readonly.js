import { map, mainBar, locate } from 'map/map'
import * as functions from 'map/functions'
import { hoverStyle, vectorStyle } from 'map/styles'
import { resetInteractions, isMobileDevice } from 'map/interactions'
import { modifyInteraction, lineInteraction, drawInteraction, pointInteraction } from 'map/interactions/edit'

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

  const viewBar = new ol.control.Bar({
    group: true, // group controls together
    toggleOne: true, // one control active at the same time
    className: 'view-bar',
    controls: [
      new ol.control.Button({
        html: "<i class='las la-mouse-pointer'></i>",
        title: 'Select',
        className: 'buttons button-select active',
        handleClick: function () {
          resetInteractions()
          document.querySelector('.button-select').classList.add('active')
          map.addInteraction(selectInteraction)
        }
      })
    ]
  })

  mainBar.addControl(viewBar)
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
    // skip hover effects when in an active modification
    const interactions = [modifyInteraction, lineInteraction, drawInteraction, pointInteraction]
    if (interactions.some(interaction => map.getInteractions().getArray().includes(interaction))) {
      return true
    }
    if (isMobileDevice()) { return true }
    // skip hover whe there is a modal shown
    if (document.querySelector('#map-modal').style.display === 'block') { return true }
    // skip hover effects when features are selected
    if (selectInteraction.getFeatures().getArray().length) { return true }
    currentlySelectedFeature = null
    map.forEachFeatureAtPixel(event.pixel, function (feature) {
      if (feature.getId() === undefined) { return false }
      currentlySelectedFeature = feature
      if (previouslySelectedFeature == null ||
      feature.getId() !== previouslySelectedFeature.getId()) {
        feature.setStyle(hoverStyle(feature))
        showFeatureDetails(feature)
      }
      return true
    }, {
      hitTolerance: 10 // Tolerance in pixels
    })

    // reset style of no more hovered feature
    if (previouslySelectedFeature &&
        (currentlySelectedFeature == null ||
          currentlySelectedFeature.getId() !== previouslySelectedFeature.getId())) {
      previouslySelectedFeature.setStyle(vectorStyle(previouslySelectedFeature))
      if (currentlySelectedFeature == null) { hideFeatureDetails() }
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
