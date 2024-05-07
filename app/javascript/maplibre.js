import { initializeMap, initializeControls, initializeMapProperties, initializeViewMode } from 'maplibre/map'
import { initializeEditMode } from 'maplibre/edit'
import { initializeSocket } from 'channels/map_channel'

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('maplibre-map')) {
      init()
    }
  })
})

async function init () {
  initializeMapProperties()

  initializeMap('maplibre-map')
  // static mode is used for screenshots
  if (window.gon.map_mode !== 'static') {
    initializeSocket()
    initializeControls()
    if (window.gon.map_mode !== 'rw') {
      initializeViewMode()
    } else {
      initializeEditMode()
    }
  }
}
