// loaded in /frontpage/index.html.haml
import { map, initializeMap, vectorSource } from 'map/map'
import { animateView } from 'map/animations'
import { initializeMapProperties, loadBackgroundMapLayer } from 'map/properties'

init()

document.addEventListener('turbo:render', function () {
  init()
})

function init () {
  if (document.getElementById('frontpage-map')) {
    initializeMapProperties()
    initializeMap('frontpage-map')
    loadBackgroundMapLayer()

    map.getInteractions().forEach(function (interaction) {
      interaction.setActive(false)
    })
  }
}

document.addEventListener('click', function (event) {
  if (event.target.tagName === 'A' && event.target.hasAttribute('data-animate-point')) {
    event.preventDefault()
    const feature = vectorSource.getFeatureById(event.target.getAttribute('data-animate-point'))
    const coords = feature.getGeometry().getCoordinates()
    const zoom = event.target.getAttribute('data-animate-zoom') || map.getView().getZoom()

    animateView(coords, zoom)
  }
})
