import { map, geojsonData, setViewFromProperties } from 'maplibre/map'
import { AnimateLineAnimation, AnimatePolygonAnimation } from 'maplibre/animations'
import * as functions from 'helpers/functions'

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    const animateFeatureId = new URLSearchParams(window.location.search).get('a')
    if (animateFeatureId) {
      init()
    }
  })
})

async function init () {
  map.on('geojson.load', async (_e) => {
    const animateFeatureId = new URLSearchParams(window.location.search).get('a')
    const feature = geojsonData.features.find(f => f.id === animateFeatureId)
    console.log('Animating ' + feature.id)
    if (feature?.geometry?.type === 'LineString') {
      await functions.sleep(1000)
      map.setZoom(14)
      map.setPitch(60)
      new AnimateLineAnimation().run(feature)
    } else if (feature?.geometry?.type === 'Polygon') {
      new AnimatePolygonAnimation().run(feature)
    } else {
      console.error('Feature to animate ' + animateFeatureId + ' not found!')
    }
    setViewFromProperties()
  })
}
