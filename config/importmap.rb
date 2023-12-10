# Pin npm packages by running ./bin/importmap

pin 'application', preload: true
pin '@hotwired/turbo-rails', to: 'turbo.min.js', preload: true
pin '@hotwired/stimulus', to: 'stimulus.min.js', preload: true
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js', preload: true

pin 'openlayers', to: 'https://ga.jspm.io/npm:openlayers@4.6.5/dist/ol.js'

pin_all_from 'app/javascript/controllers', under: 'controllers'
pin '@rails/actioncable', to: 'actioncable.esm.js'
pin_all_from 'app/javascript/channels', under: 'channels'

pin_all_from 'app/javascript/map', under: 'map'
