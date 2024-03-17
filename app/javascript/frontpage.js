// loaded in /frontpage/index.html.haml
import { map, initializeMap, vectorSourceFromUrl } from 'map/map'
import { initializeMapProperties, loadBackgroundMapLayer } from 'map/properties'
import { vectorStyle } from 'map/styles'
import * as functions from 'helpers/functions'
import * as dom from 'helpers/dom'

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
  loadBackgroundMapLayer()

  map.getInteractions().forEach(function (interaction) {
    interaction.setActive(false)
  })
}

// Your story/data/friends/events/places/ on a map
async function featureShow () {
  const show = [{ key: 'friends', map: 'frontpage-category-friends' }, // 65f22a746dbf9a466487d9b4
    { key: 'data', map: 'frontpage-category-data' }, // 65bcf7b46dbf9a36cfa3ca97
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

    // load a data layer onto the map
    const url = '/maps/' + category.map + '/features'
    const featureSource = vectorSourceFromUrl(url)

    if (window.featureLayer) {
      await functions.sleep(500)
      map.removeLayer(window.featureLayer)
      document.querySelector('.category-features').remove()
    }

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
    document.querySelector('.category-features').style.opacity = 0
    document.querySelector('.frontpage-subtitle').style.opacity = 0
    await functions.sleep(2000)
  }
}
