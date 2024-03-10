// loaded in /frontpage/index.html.haml
import { map, initializeMap } from 'map/map'
import { initializeMapProperties, loadBackgroundMapLayer } from 'map/properties'

document.addEventListener('turbo:load', function () {
  if (document.getElementById('frontpage-map')) {
    init()
  }
})

function init () {
  initializeMapProperties()
  initializeMap('frontpage-map')
  loadBackgroundMapLayer()

  map.getInteractions().forEach(function (interaction) {
    interaction.setActive(false)
  })
}
