import { initializeMap, mapProperties, setBackgroundMapLayer, initializeViewMode, initializeStaticMode } from 'maplibre/map'
import { initializeEditMode } from 'maplibre/edit'
import { initializeSocket } from 'channels/map_channel'

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('maplibre-map') && !mapProperties) {
      init()
    }
  })
})

// On first Turbo navigation to the map page, the module import
// is finished only after the 'turbo:load' event. So we're initializing the
// map here, and check if mapProperties are loaded to avoid double load on direct page load
if (document.getElementById('maplibre-map') && !mapProperties) {
  init()
}

async function init () {
  initializeMap('maplibre-map')
  // static mode is used for screenshots + frontpage
  if (window.gon.map_mode === 'static') {
    initializeStaticMode()
  } else {
    initializeSocket()
    window.gon.map_mode !== 'rw' ? initializeViewMode() : initializeEditMode()
  }
  setBackgroundMapLayer()
}
