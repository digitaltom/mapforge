import { Controller } from '@hotwired/stimulus'
import * as functions from 'helpers/functions'

export default class extends Controller {
  connect () {
    functions.e('#map-header', e => { e.style.display = 'none' })
  }

  toggleNavigation (event) {
    if (document.querySelector('#map-header').style.display === 'none') {
      functions.e('#map-header', e => { e.style.display = 'block' })
      functions.e('#map-nav-toggle', e => { e.classList.remove('bi-caret-down') })
      functions.e('#map-nav-toggle', e => { e.classList.add('bi-caret-up') })
    } else {
      functions.e('#map-header', e => { e.style.display = 'none' })
      functions.e('#map-nav-toggle', e => { e.classList.remove('bi-caret-up') })
      functions.e('#map-nav-toggle', e => { e.classList.add('bi-caret-down') })
    }
  }
}
