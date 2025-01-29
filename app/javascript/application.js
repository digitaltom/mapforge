// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import '@hotwired/turbo-rails'

// Importing maplibre + controllers early here, because loading them later
// from maplibre.haml caused issues with the turbo:load event which was received
// before the module finished loading
import 'maplibre'
import 'controllers'

import AOS from 'aos'

// for debugging
window.AOS = AOS

// https://github.com/michalsnik/aos
AOS.init({
  duration: 600,
  easing: 'ease-in-out',
  once: true
})
