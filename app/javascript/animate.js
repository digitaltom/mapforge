import { map, geojsonData, destroy, addFeature, redrawGeojson } from 'maplibre/map'

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    console.log(e)
    const animateFeatureId = new URLSearchParams(window.location.search).get('animate')
    if (animateFeatureId) {
      init()
    }
  })
})

async function init () {
  map.on('geojson.load', (e) => {
    const animateFeatureId = new URLSearchParams(window.location.search).get('animate')
    const feature = geojsonData.features.find(f => f.id === animateFeatureId)
    if (feature) {
      animateLine(feature)
    } else {
      console.error('Feature to animate ' + animateFeatureId + ' not found!')
    }
  })
}

function animateLine (line) {
  // drop feature from map
  destroy(line.id)
  const animationLine = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        line.geometry.coordinates[0]
      ]
    },
    properties: line.properties
  }
  geojsonData.features.push(animationLine)
  console.log('Animating ' + line.id)

  const lineDistance = window.turf.lineDistance(line, 'kilometers')
  console.log('Line length: ' + lineDistance + ' km')
  const steps = 500

  let counter = 0
  map.setZoom(16)
  map.setPitch(60)

  function animate (timestamp) {
    const progress = counter / steps
    const distance = progress * lineDistance
    const coordinates = window.turf.along(line, distance, 'kilometers').geometry.coordinates
    // console.log("Frame #" + timestamp + ", distance: " + distance + ", coords: " + coordinates)

    animationLine.geometry.coordinates.push(coordinates)
    // console.log("New line coords: " + animationLine.features[0].geometry.coordinates)
    redrawGeojson()

    // Update camera position
    map.setCenter(coordinates, 12)
    map.setBearing(map.getBearing() + 1)
    counter++

    if (counter <= steps) {
      requestAnimationFrame(animate)
    } else {
      // after animation is done, re-add original line
      addFeature(line)
    }
  }

  animate(0)
}
