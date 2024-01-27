import { map } from 'map/map'

// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

export class FPSControl extends ol.control.Control {
  constructor () {
    const options = {}

    const button = document.createElement('button')
    button.innerHTML = 'FPS'

    const element = document.createElement('div')
    element.className = 'fps-control ol-unselectable'
    element.appendChild(button)

    super({
      element,
      target: options.target
    })

    let lastRender = Date.now()
    let fps = 0
    let currentFps = 0
    const alpha = 0.1

    map.on('postcompose', function () {
      const now = Date.now()
      const delta = now - lastRender
      currentFps = Math.round(1000 / delta)
      fps = alpha * currentFps + (1 - alpha) * fps
      lastRender = now
      button.innerHTML = 'FPS: ' + currentFps
    })
  }
}
