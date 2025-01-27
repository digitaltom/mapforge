// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import { Turbo } from "@hotwired/turbo-rails"
import AOS from 'aos'

// for debugging
window.AOS = AOS

// https://github.com/michalsnik/aos
AOS.init({
  duration: 600,
  easing: 'ease-in-out',
  once: true
});
