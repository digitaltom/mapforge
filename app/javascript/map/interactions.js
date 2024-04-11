import { map, mainBar, vectorSource } from 'map/map'
import { selectInteraction, hideFeaturePopup } from 'map/interactions/readonly'
import {
  drawInteraction, pointInteraction, lineInteraction, modifyInteraction,
  polygonInteraction, bannerInteraction, selectEditInteraction, hideFeatureEdit
} from 'map/interactions/edit'
import { animateView } from 'map/animations'
import { vectorStyle } from 'map/styles'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const Turbo = window.Turbo

export function initializeMainInteractions () {
  const homeButton = new ol.control.Button({
    html: "<i class='bi-house'></i>",
    title: 'Back to Start',
    className: 'buttons button-home',
    handleClick: function () {
      Turbo.visit('/')
    }
  })
  mainBar.addControl(homeButton)

  // Clicks outside of an active modal close it and go into select mode
  map.getTargetElement().onclick = function (event) {
    document.querySelectorAll('.map-modal').forEach(modal => {
      if (event.target !== modal && modal.style.display === 'block') {
        resetInteractions()
        map.addInteraction(selectInteraction)
      }
    })
  }
}

export function resetInteractions () {
  [drawInteraction, pointInteraction, lineInteraction, polygonInteraction,
    modifyInteraction, bannerInteraction].forEach(function (interaction) {
    map.removeInteraction(interaction)
  })
  if (selectInteraction) {
    selectInteraction.getFeatures().forEach(function (feature) {
      feature.setStyle(vectorStyle(feature))
      feature.changed()
      vectorSource.changed()
    })
    selectInteraction.getFeatures().clear()
  }
  map.removeInteraction(selectInteraction)
  if (selectEditInteraction) {
    selectEditInteraction.getFeatures().forEach(function (feature) {
      feature.setStyle(vectorStyle(feature))
      feature.changed()
      vectorSource.changed()
    })
    selectEditInteraction.getFeatures().clear()
  }
  map.removeInteraction(selectEditInteraction)
  document.querySelectorAll('.buttons').forEach(button => {
    button.classList.remove('active')
  })
  document.querySelectorAll('.sub-bar').forEach(subBar => {
    subBar.classList.add('hidden')
  })
  document.querySelectorAll('.map-modal').forEach(modal => {
    modal.style.display = 'none'
  })
  hideFeaturePopup()
  hideFeatureEdit()
}

document.addEventListener('click', function (event) {
  if (map && map.getInteractions().getArray().includes(selectEditInteraction)) {
    event.preventDefault()
    return false
  }

  if (event.target.tagName === 'A' && event.target.hasAttribute('data-animate-point')) {
    event.preventDefault()
    const feature = vectorSource.getFeatureById(event.target.getAttribute('data-animate-point'))
    if (!feature) { console.log('data-animate-point not found'); return false }
    const coords = feature.getGeometry().getCoordinates()
    const zoom = event.target.getAttribute('data-animate-zoom') || map.getView().getZoom()

    animateView(coords, zoom)
  }
})

export function createFeatureId () {
  return Math.random().toString(16).slice(6)
}
