// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import '@hotwired/turbo-rails'
import 'controllers'

// always load map js, so it can initialize on 'turbo:load'
import 'map/map'
