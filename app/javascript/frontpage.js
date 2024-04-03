// loaded in /frontpage/index.html.haml
import { map, initializeMap, vectorSourceFromUrl, setBackgroundMapLayer } from 'map/map'
import { initializeMapProperties } from 'map/properties'
import { vectorStyle } from 'map/styles'
import * as functions from 'helpers/functions'
import * as dom from 'helpers/dom'
import { animateMarkerPath } from 'map/animations'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

let featureShowInterval
let featureLayer
let featureShowIndex = 0
const featureShowList = [
  { key: 'friends', map: 'frontpage-category-friends' },
  { key: 'indoors', map: 'frontpage-category-office' },
  { key: 'data', map: 'frontpage-category-data' }
  // { key: 'story', map: 'frontpage-category-data' },
  // { key: 'events', map: 'frontpage-category-data' },
  // { key: 'places', map: 'frontpage-category-data' }
];

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('frontpage-map')) {
      init()

      console.log('starting frontpage tour')
      featureShow()
      featureShowInterval = setInterval(function () {
        featureShow()
      }, 10000)
    }
  })
});

['turbo:before-visit', 'beforeunload'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (featureShowInterval) { clearInterval(featureShowInterval); featureShowInterval = null }
  })
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
  const category = featureShowList[featureShowIndex]
  featureShowIndex = (featureShowIndex + 1) % featureShowList.length

  console.log('frontpage tour: ' + category.key)

  fetch('/maps/' + category.map + '/properties')
    .then(response => {
      if (!response.ok) { throw new Error("Map '" + category.map + "' not found.") }
      return response.json()
    })
    .then(async function (properties) {
      // fade out feature layer
      if (document.querySelector('.category-features')) {
        document.querySelector('.category-features').style.opacity = 0
        document.querySelector('.frontpage-subtitle').style.opacity = 0
        document.querySelector('.map-layer').style.opacity = 0

        await functions.sleep(2000)
        map.removeLayer(featureLayer)
        document.querySelector('.category-features').remove()
      }

      setBackgroundMapLayer(properties.base_map)
      map.getView().setCenter(ol.proj.fromLonLat(properties.center))
      map.getView().setZoom(properties.zoom)
      // animateView(ol.proj.fromLonLat(properties.center), properties.zoom)

      // set title
      document.querySelector('#frontpage-category-name').innerHTML = category.key
      document.querySelector('.frontpage-subtitle').style.opacity = 1

      // load a data layer onto the map
      const url = '/maps/' + category.map + '/features'
      const featureSource = vectorSourceFromUrl(url)

      featureLayer = new ol.layer.Vector({
        source: featureSource,
        style: vectorStyle,
        className: 'category-features fade-in'
      })
      map.addLayer(featureLayer)
      dom.waitForElement('.category-features', async function changeOpacity (el) {
        await functions.sleep(500)
        el.style.opacity = 1

        if (category.key === 'data') {
          // car
          animateMarkerPath(featureSource.getFeatureById('d9b8c95728'),
            featureSource.getFeatureById('3174f4452'))
          // train
          animateMarkerPath(featureSource.getFeatureById('38488b9d78'),
            featureSource.getFeatureById('7afc4ef808'))
        }
      })
    })
    .catch(error => console.error('Error loading map properties:', error))
}
