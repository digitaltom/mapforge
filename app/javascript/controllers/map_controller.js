import { Controller } from '@hotwired/stimulus'
import * as functions from 'helpers/functions'
import { animateElement } from 'helpers/dom'

export default class extends Controller {
  connect () {
    functions.e('#map-header', e => { e.style.display = 'none' })
  }

  toggleNavigation (event) {
    if (document.querySelector('#map-header').style.display === 'none') {
      functions.e('#map-header', e => { e.style.display = 'block' })
      functions.e('.map-modal', e => { e.style.top = '4em' })
      functions.e('#map-nav-toggle', e => {
        e.classList.remove('bi-caret-down')
        e.classList.add('bi-caret-up')
      })
      functions.e('#map-head', e => { e.style.top = '60px' })
      functions.e('.maplibregl-ctrl-top-left', e => { e.style.top = '60px' })
      functions.e('.maplibregl-ctrl-top-right', e => { e.style.top = '60px' })
      animateElement('.navbar', 'fade-down')
    } else {
      functions.e('#map-header', e => { e.style.display = 'none' })
      functions.e('.map-modal', e => { e.style.top = '0' })
      functions.e('#map-nav-toggle', e => {
        e.classList.remove('bi-caret-up')
        e.classList.add('bi-caret-down')
      })
      functions.e('#map-head', e => { e.style.top = 'unset' })
      functions.e('.maplibregl-ctrl-top-left', e => { e.style.top = 'unset' })
      functions.e('.maplibregl-ctrl-top-right', e => { e.style.top = 'unset' })
    }
  }
}
