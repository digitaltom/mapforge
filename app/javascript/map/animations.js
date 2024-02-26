import { map } from 'map/map'
import { backgroundMapLayer } from 'map/properties'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

export function animateMarker (feature, start, end) {
  console.log('Animating ' + feature.getId() + ' from ' + JSON.stringify(start) + ' to ' + JSON.stringify(end))
  const startTime = Date.now()
  const listenerKey = backgroundMapLayer.on('postrender', animate)

  const duration = 300
  function animate (event) {
    const frameState = event.frameState
    const elapsed = frameState.time - startTime
    if (elapsed >= duration) {
      ol.Observable.unByKey(listenerKey)
      return
    }
    const elapsedRatio = elapsed / duration
    const currentCoordinate = [
      start[0] + elapsedRatio * (end[0] - start[0]),
      start[1] + elapsedRatio * (end[1] - start[1])
    ]
    feature.getGeometry().setCoordinates(currentCoordinate)
    map.render()
  }
}

export function animateView (coords, zoom = map.getView().getZoom()) {
  const animationOptions = {
    center: coords,
    duration: 2000, // in ms
    easing: ol.easing.easeInOut,
    zoom
  }
  map.getView().animate(animationOptions)
}
