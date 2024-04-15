// loaded in /maps/show.html.haml
import { initializeMap, setBackgroundMapLayer } from 'ol/map'
import { initializeSocket } from 'channels/map_channel'
import { initializeMapModal, initializeMapProperties } from 'ol/properties'
import { initializeMainInteractions } from 'ol/interactions'
import { initializeReadonlyInteractions } from 'ol/interactions/readonly'
import { initializeEditInteractions } from 'ol/interactions/edit'

document.addEventListener('turbo:load', function () {
  if (document.getElementById('map')) {
    init()
  }
})

function init () {
  initializeMapProperties()
  initializeMap('map')
  setBackgroundMapLayer()
  // static mode is used for screenshots
  if (window.gon.map_mode !== 'static') {
    initializeSocket()
    initializeMainInteractions()
    initializeReadonlyInteractions()
    if (window.gon.map_mode === 'rw') {
      initializeMapModal()
      initializeEditInteractions()
    }
  }
}
