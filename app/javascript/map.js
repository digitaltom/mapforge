// loaded in /maps/show.html.haml
import { initializeMap, setBackgroundMapLayer } from 'map/map'
import { initializeSocket } from 'channels/map_channel'
import { initializeMapModal, initializeMapProperties } from 'map/properties'
import { initializeMainInteractions } from 'map/interactions'
import { initializeReadonlyInteractions } from 'map/interactions/readonly'
import { initializeEditInteractions } from 'map/interactions/edit'

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
