import { map } from 'map/map'
import { selectInteraction, hideFeatureDetails } from 'map/interactions/readonly'
import { drawInteraction, pointInteraction, lineInteraction, modifyInteraction, selectEditInteraction, hideFeatureEdit } from 'map/interactions/edit'

export function resetInteractions () {
  map.removeInteraction(drawInteraction)
  map.removeInteraction(pointInteraction)
  map.removeInteraction(lineInteraction)
  map.removeInteraction(modifyInteraction)
  selectInteraction.getFeatures().clear()
  map.removeInteraction(selectInteraction)
  selectEditInteraction.getFeatures().clear()
  map.removeInteraction(selectEditInteraction)
  Array.from(document.getElementsByClassName('buttons')).forEach(function (button) {
    button.classList.remove('active')
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
