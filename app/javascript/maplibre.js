import { initializeMap, setBackgroundMapLayer, initializeViewMode, initializeStaticMode } from 'maplibre/map'
import { initializeEditMode } from 'maplibre/edit'
import { initializeSocket } from 'channels/map_channel'
import AOS from 'aos'

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('maplibre-map')) {
      init()
    }
  })
})

async function init () {
  aosInit()
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

function aosInit () {
  AOS.init({
    duration: 600,
    easing: 'ease-in-out',
    once: true
  })
}
