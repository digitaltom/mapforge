import { map, geojsonData } from 'maplibre/map'
import * as functions from 'helpers/functions'
import { draw } from 'maplibre/edit'

// eslint expects variables to get imported, but we load the full lib in header


export function rotateCamera(timestamp=0) {
    // clamp the rotation between 0-360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 250) % 360, { duration: 0 })
    requestAnimationFrame(rotateCamera)
}

export function animatePoint (feature, end, duration = 300) {
  const starttime = performance.now()
  const start = feature.geometry.coordinates
  console.log('Animating point from: ' + start + ' to ' + end)

  function animate (timestamp) {
    // stop animation in case the feature got removed
    if (!geojsonData || !geojsonData.features.find(f => f.id === feature.id)) {
      console.log('cancelling animation of ' + feature.id)
      return
    }

    let progress = (timestamp - starttime) / duration
    if (progress > 1) { progress = 1 }
    const newCoordinates = [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress
    ]
    // console.log('new coords: ' + newCoordinates)
    feature.geometry.coordinates = newCoordinates
    map.getSource('geojson-source').setData(geojsonData)
    if (draw) { draw.set(geojsonData) }

    if (progress < 1) { requestAnimationFrame(animate) }
  }
  requestAnimationFrame(animate)
}

export async function animatePointPath (feature, path) {
  const coordinates = path.geometry.coordinates
  console.log('Animating ' + feature.id + ' along ' + path.id)
  // Loop over the coordinates
  for (let i = 0; i < coordinates.length - 1; i++) {
    // stop animation in case the feature got removed
    // if (!geojsonData || !geojsonData.features.find(f => f.id === feature.id)) { break }
    const distance = turf.distance(turf.point(coordinates[i]),
      turf.point(coordinates[i + 1]), { units: 'meters' })
    const speed = 0.75 // ~ 500m/s
    const time = Math.round(distance) / speed
    animatePoint(feature, coordinates[i + 1], time)
    await functions.sleep(time)
  }
}
