// loaded in /frontpage/index.html.haml
import {
  initializeMap, setBackgroundMapLayer, geojsonData,
  initializeStaticMode, initializeMaplibreProperties, map
} from 'maplibre/map'
import { RotateCameraAnimation, AnimatePointAnimation } from 'maplibre/animations'
import * as functions from 'helpers/functions'

// eslint expects variables to get imported, but we load the full lib in header

let featureShowInterval
let featureShowIndex = 0
let activeAnimations = []
let category
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
      callbacks()
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
  stopAnimations()
}

function stopAnimations () {
  activeAnimations.forEach(function (a) {
    a.stopAnimation()
  })
  activeAnimations = []
}

function init () {
  unload()
  initializeMap('frontpage-map')
  initializeStaticMode()
}

// Your story/data/friends/events/places/track on a map
async function featureShow () {
  stopAnimations()
  category = featureShowList[featureShowIndex]
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
      await functions.sleep(500)

      window.gon.map_id = properties.public_id
      window.gon.map_properties = properties

      initializeMaplibreProperties()
      setBackgroundMapLayer(properties.base_map)
      map.setCenter(properties.center)
      map.setZoom(properties.zoom)
    })
    .catch(error => console.error('Error loading ' + category.key + ': ', error))
}

function callbacks () {
  map.on('geojson.load', function (e) {
    // give the map some time to load + fade in
    // functions.sleep(1000)
    functions.e('#frontpage-map', e => { e.style.opacity = 0.5 })
    functions.e('#frontpage-category-name', e => { e.innerHTML = category.key })
    functions.e('.frontpage-subtitle', e => { e.style.opacity = 1 })
    map.fire('category.load')
  })

  map.on('category.load', function (e) {
    console.log('frontpage category.load')

    if (category.key === 'friends') {
      const animation = new RotateCameraAnimation()
      activeAnimations.push(animation)
      animation.run()
    }

    if (category.key === 'indoors') {
      const center = geojsonData.features.find(feature => feature.id === 'f2c7934029981a12545be52f0656caff')
      console.log(center.geometry.coordinates)
      map.flyTo({
        center: center.geometry.coordinates,
        zoom: 19.2,
        essential: true,
        // bearing: 0,
        speed: 0.1, // make the flying slow
        curve: 1, // change the speed at which it zooms out
        // This can be any easing function: it takes a number between
        // 0 and 1 and returns another number between 0 and 1.
        easing (t) {
          return t
        }
      })
    }

    if (category.key === 'data') {
      // train (d9b8c95728, 3174f4452)
      const train = geojsonData.features.find(feature => feature.id === '38488b9d78')
      let path = geojsonData.features.find(feature => feature.id === '7afc4ef808')
      const trainAnimation = new AnimatePointAnimation()
      activeAnimations.push(trainAnimation)
      // trainAnimation.animatePointPath(train, path)

      // truck (14a86bd238, 19e435d8b8)
      const truck = geojsonData.features.find(feature => feature.id === '14a86bd238')
      path = geojsonData.features.find(feature => feature.id === '19e435d8b8')
      const truckAnimation = new AnimatePointAnimation()
      activeAnimations.push(truckAnimation)
      // truckAnimation.animatePointPath(truck, path)

      // car (d9b8c95728, 3174f4452)
      const car = geojsonData.features.find(feature => feature.id === 'd9b8c95728')
      path = geojsonData.features.find(feature => feature.id === '3174f4452')
      const carAnimation = new AnimatePointAnimation()
      activeAnimations.push(carAnimation)
      // carAnimation.animatePointPath(car, path)
    }
  })
}
