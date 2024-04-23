// import { hexToRgb } from 'helpers/functions'
import { initializeMapProperties } from 'ol/properties'
import { initializeMap, initializeReadonlyInteractions } from 'maplibre/map'
import { initializeEditInteractions } from 'maplibre/edit'

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
  //   initializeSocket()
  //   initializeMainInteractions()
    initializeReadonlyInteractions()
    if (window.gon.map_mode === 'rw') {
      //     initializeMapModal()
      initializeEditInteractions()
    }
  }
}
