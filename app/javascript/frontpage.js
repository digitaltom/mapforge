// loaded in /frontpage/index.html.haml
import { initializeMap, setBackgroundMapLayer, geojsonData,
  initializeStaticMode, initializeMaplibreProperties, map, mapProperties } from 'maplibre/map'
import * as functions from 'helpers/functions'
import { initializeViewStyles } from 'maplibre/styles'

// eslint expects variables to get imported, but we load the full lib in header

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



      // fade out feature layer


      // if (featureLayer) {
      //   functions.e('.category-features', e => { e.style.opacity = 0 })
      //   functions.e('.frontpage-subtitle', e => { e.style.opacity = 0 })
      //   functions.e('.map-layer', e => { e.style.opacity = 0 })

      //   await functions.sleep(2000)
      //   featureLayer.getSource().clear()
      //   map.removeLayer(featureLayer)
      //   functions.e('.category-features', e => e.remove())
      // }
      window.gon.map_id = properties.public_id
      window.gon.map_properties = properties
      initializeMaplibreProperties()

      setBackgroundMapLayer(properties.base_map)
      //map.getView().setCenter(ol.proj.fromLonLat(properties.center))
      //map.getView().setZoom(properties.zoom)
      // animateView(ol.proj.fromLonLat(properties.center), properties.zoom)
      map.setCenter(properties.center)
      map.setZoom(properties.zoom)

      // set title
      functions.e('#frontpage-category-name', e => { e.innerHTML = category.key })
      functions.e('.frontpage-subtitle', e => { e.style.opacity = 1 })

      // load a data layer onto the map
      //const url = '/maps/' + category.map + '/features'
      // const featureSource = vectorSourceFromUrl(url)
      //loadGeoJsonData()

      // featureLayer = new ol.layer.Vector({
      //   source: featureSource,
      //   style: vectorStyle,
      //   className: 'category-features fade-in'
      // })
      // map.addLayer(featureLayer)
      // dom.waitForElement('.category-features', async function changeOpacity (el) {
      //   await functions.sleep(500)
      //   el.style.opacity = 1

      //   if (category.key === 'data') {
      //     // car
      //     animateMarkerPath(featureSource.getFeatureById('d9b8c95728'),
      //       featureSource.getFeatureById('3174f4452'))
      //     // train
      //     animateMarkerPath(featureSource.getFeatureById('38488b9d78'),
      //       featureSource.getFeatureById('7afc4ef808'))
      //     // truck
      //     animateMarkerPath(featureSource.getFeatureById('14a86bd238'),
      //       featureSource.getFeatureById('19e435d8b8'))
      //   }
      // })
    })
    .catch(error => console.error('Error loading map properties:', error))
}
