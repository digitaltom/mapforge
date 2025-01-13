// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import '@hotwired/turbo-rails'
import 'controllers'

import 'frontpage'
import 'maplibre'
import 'animate'

import AOS from 'aos'

// for debugging
window.AOS = AOS

AOS.init({
  duration: 600,
  easing: 'ease-in-out',
  once: true
})
