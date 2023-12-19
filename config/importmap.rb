# Pin npm packages by running ./bin/importmap pin <npm module name>@<version> --from jspm|unpkg|jsdelivr --download
# https://github.com/rails/importmap-rails

pin 'application', preload: true
pin '@hotwired/turbo-rails', to: 'turbo.min.js', preload: true
pin '@hotwired/stimulus', to: 'stimulus.min.js', preload: true
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js', preload: true
pin '@rails/actioncable', to: 'actioncable.esm.js', preload: true

pin_all_from 'app/javascript/controllers', under: 'controllers'
pin_all_from 'app/javascript/channels', under: 'channels'

pin_all_from 'app/javascript/map', under: 'map'

# openlayers modules need to get pulled individually
openlayers_base_url = 'https://dev.jspm.io/npm:ol@8.1.0/'
pin 'ol', to: "#{openlayers_base_url}index.js"
pin 'ol/control', to: "#{openlayers_base_url}control"
pin 'ol/proj', to: "#{openlayers_base_url}proj"
pin 'ol/format', to: "#{openlayers_base_url}format"
pin 'ol/source', to: "#{openlayers_base_url}source"
pin 'ol/layer', to: "#{openlayers_base_url}layer"
pin 'ol/interaction', to: "#{openlayers_base_url}interaction"
pin 'ol/style', to: "#{openlayers_base_url}style"
