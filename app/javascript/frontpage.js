// loaded in /frontpage/index.html.haml
import {
  initializeMap, setBackgroundMapLayer,
  initializeStaticMode, initializeMaplibreProperties, map
} from 'maplibre/map'
import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header

let featureShowInterval
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
    unload()
  })
})

function unload () {
  if (featureShowInterval) { clearInterval(featureShowInterval) }
  featureShowInterval = null
}

function init () {
  unload()
  initializeMap('frontpage-map')
  initializeStaticMode()
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
      // fade out map
      functions.e('#frontpage-map', e => { e.style.opacity = 0 })
      functions.e('.frontpage-subtitle', e => { e.style.opacity = 0 })
      await functions.sleep(700)

      window.gon.map_id = properties.public_id
      window.gon.map_properties = properties

      initializeMaplibreProperties()
      setBackgroundMapLayer(properties.base_map)
      map.setCenter(properties.center)
      map.setZoom(properties.zoom)

      // give the map some time to load + fade in
      await functions.sleep(1200)
      functions.e('#frontpage-map', e => { e.style.opacity = 0.5 })
      functions.e('#frontpage-category-name', e => { e.innerHTML = category.key })
      functions.e('.frontpage-subtitle', e => { e.style.opacity = 1 })

      if (category.key === 'data') {
      //     // car
      //     animateMarkerPath(featureSource.getFeatureById('d9b8c95728'),
      //       featureSource.getFeatureById('3174f4452'))
      //     // train
      //     animateMarkerPath(featureSource.getFeatureById('38488b9d78'),
      //       featureSource.getFeatureById('7afc4ef808'))
      //     // truck
      //     animateMarkerPath(featureSource.getFeatureById('14a86bd238'),
      //       featureSource.getFeatureById('19e435d8b8'))

      }
    })
    .catch(error => console.error('Error loading ' + category.key + ': ', error))
}
