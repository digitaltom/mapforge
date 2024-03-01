import { map, mainBar, vectorSource } from 'map/map'
import { selectInteraction, hideFeatureDetails } from 'map/interactions/readonly'
import {
  drawInteraction, pointInteraction, lineInteraction, modifyInteraction,
  polygonInteraction, bannerInteraction, selectEditInteraction, hideFeatureEdit
} from 'map/interactions/edit'
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
  document.querySelector('#map-modal').style.display = 'none'
  hideFeatureDetails()
  hideFeatureEdit()
}

export function createFeatureId () {
  return Math.random().toString(16).slice(2)
}

export function isMobileDevice () {
  return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
}
