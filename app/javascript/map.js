// loaded in /maps/show.html.haml
import { initializeMap } from 'map/map'
import { initializeSocket } from 'channels/map_channel'
import { initializeMapModal, initializeMapProperties, loadBackgroundMapLayer } from 'map/properties'
import { initializeMainInteractions } from 'map/interactions'
import { initializeReadonlyInteractions } from 'map/interactions/readonly'
import { initializeEditInteractions } from 'map/interactions/edit'

init()

document.addEventListener('turbo:render', function () {
  init()
})

function init () {
  if (document.getElementById('map')) {
    initializeMapProperties()
    initializeMap('map')
    loadBackgroundMapLayer()
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
}
