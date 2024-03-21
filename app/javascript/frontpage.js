// loaded in /frontpage/index.html.haml
import { map, initializeMap, vectorSourceFromUrl, setBackgroundMapLayer } from 'map/map'
import { initializeMapProperties } from 'map/properties'
import { vectorStyle } from 'map/styles'
import * as functions from 'helpers/functions'
import * as dom from 'helpers/dom'
import { animateView } from 'map/animations'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

document.addEventListener('turbo:load', function () {
  if (document.getElementById('frontpage-map')) {
    init()
    featureShow()
  }
})

function init () {
  initializeMapProperties()
  initializeMap('frontpage-map')
  setBackgroundMapLayer()

  map.getInteractions().forEach(function (interaction) {
    interaction.setActive(false)
  })
}

// Your story/data/friends/events/places/track on a map
async function featureShow () {
  const show = [
    { key: 'friends', map: 'frontpage-category-friends' },
    { key: 'data', map: 'frontpage-category-data' },
    { key: 'story', map: 'frontpage-category-data' },
    { key: 'events', map: 'frontpage-category-data' },
    { key: 'places', map: 'frontpage-category-data' }
  ]

  let index = 0
  while (true) {
    const category = show[index]
    index = (index + 1) % show.length

    // set title
    document.querySelector('#frontpage-category-name').innerHTML = category.key
    document.querySelector('.frontpage-subtitle').style.opacity = 1

    fetch('/maps/' + category.map + '/properties')
      .then(response => response.json())
      .then(properties => {
        setBackgroundMapLayer(properties.base_map)
        // map.getView().setCenter(ol.proj.fromLonLat(properties.center))
        // map.getView().setZoom(properties.zoom)
        animateView(ol.proj.fromLonLat(properties.center), properties.zoom)
      })
      .catch(error => console.error('Error loading map properties:', error))

    // load a data layer onto the map
    const url = '/maps/' + category.map + '/features'
    const featureSource = vectorSourceFromUrl(url)

    window.featureLayer = new ol.layer.Vector({
      source: featureSource,
      style: vectorStyle,
      className: 'category-features fade-in'
    })
    map.addLayer(window.featureLayer)
    dom.waitForElement('.category-features', function changeOpacity (el) {
      el.style.opacity = 1
    })

    await functions.sleep(7000)

    // fade out feature layer
    document.querySelector('.category-features').style.opacity = 0
    document.querySelector('.frontpage-subtitle').style.opacity = 0
    await functions.sleep(2000)
    map.removeLayer(window.featureLayer)
    document.querySelector('.category-features').remove()
  }
}
