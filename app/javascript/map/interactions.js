import { map, mainBar } from 'map/map'
import { selectInteraction, hideFeatureDetails } from 'map/interactions/readonly'
import {
  drawInteraction, pointInteraction, lineInteraction, modifyInteraction,
  polygonInteraction, selectEditInteraction, hideFeatureEdit
} from 'map/interactions/edit'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const Turbo = window.Turbo

export function initializeMainInteractions () {
  const homeButton = new ol.control.Button({
    html: "<i class='las la-home'></i>",
    title: 'Back to map list',
    className: 'buttons button-home',
    handleClick: function () {
      Turbo.visit('/maps')
    }
  })
  mainBar.addControl(homeButton)
}

export function resetInteractions () {
  map.removeInteraction(drawInteraction)
  map.removeInteraction(polygonInteraction)
  map.removeInteraction(pointInteraction)
  map.removeInteraction(lineInteraction)
  map.removeInteraction(modifyInteraction)
  if (selectInteraction) { selectInteraction.getFeatures().clear() }
  map.removeInteraction(selectInteraction)
  if (selectEditInteraction) { selectEditInteraction.getFeatures().clear() }
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
