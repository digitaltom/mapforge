import { map, geojsonData } from 'maplibre/map'
import * as functions from 'helpers/functions'
import { draw } from 'maplibre/edit'

// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

export class AnimationManager {
  constructor () {
    this.animationId = null
  }

  stopAnimation () {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }
}

export class RotateCameraAnimation extends AnimationManager {
  // Using arrow function because they do not have their own this context,
  // they inherit this from the enclosing AnimationManager instance,
  // so that 'this' keeps pointing to the class instance
  run = (timestamp = 0) => {
    // clamp the rotation between 0-360 degrees
    // Divide timestamp by 100 to slow rotation to ~10 degrees / sec
    map.rotateTo((timestamp / 400) % 360, { duration: 0 })
    this.animationId = requestAnimationFrame(this.run)
  }
}

export class AnimatePointAnimation extends AnimationManager {
  animatePoint = (feature, end, duration = 300) => {
    const starttime = performance.now()
    const start = feature.geometry.coordinates
    console.log('Animating point from: ' + start + ' to ' + end)

    const animate = (timestamp) => {
      let progress = (timestamp - starttime) / duration
      if (progress > 1) { progress = 1 }
      // console.log('progress: ' + progress)
      const newCoordinates = [
        start[0] + (end[0] - start[0]) * progress,
        start[1] + (end[1] - start[1]) * progress
      ]
      feature.geometry.coordinates = newCoordinates
      map.getSource('geojson-source').setData(geojsonData)
      if (draw) { draw.set(geojsonData) }

      if (progress < 1) { this.animationId = requestAnimationFrame(animate) }
    }
    this.animationId = requestAnimationFrame(animate)
  }

  async animatePointPath (feature, path) {
    const coordinates = path.geometry.coordinates
    console.log('Animating ' + feature.id + ' along ' + path.id)
    // Loop over the coordinates
    for (let i = 0; i < coordinates.length - 1; i++) {
      const distance = turf.distance(turf.point(coordinates[i]),
        turf.point(coordinates[i + 1]), { units: 'meters' })
      const speed = 0.6 // ~ 500m/s
      const duration = Math.round(distance) / speed
      this.animatePoint(feature, coordinates[i + 1], duration)
      await functions.sleep(duration)
      // if the animation was cancelled break path loop
      if (this.animationId === null) { break }
    }
  }
}
