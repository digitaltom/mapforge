# Pin npm packages by running ./bin/importmap pin <npm module name>@<version> --from jspm|unpkg|jsdelivr --download
# https://github.com/rails/importmap-rails

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: false
pin "@rails/actioncable", to: "actioncable.esm.js"

pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/channels", under: "channels"

pin_all_from "app/javascript/maplibre", under: "maplibre"
pin_all_from "app/javascript/helpers", under: "helpers"

# page initializers
pin "frontpage"
pin "deck", preload: false
pin "maplibre"
pin "animate"

# vendor
# examples: https://generator.jspm.io/
# https://github.com/mapbox/mapbox-gl-draw
pin "@mapbox/mapbox-gl-draw", to: "https://ga.jspm.io/npm:@mapbox/mapbox-gl-draw@1.4.3/dist/mapbox-gl-draw.js",
preload: false
# https://github.com/zakjan/mapbox-gl-draw-waypoint
pin "mapbox-gl-draw-waypoint",
  to: "https://ga.jspm.io/npm:mapbox-gl-draw-waypoint@1.2.3/dist/mapbox-gl-draw-waypoint.esm.js", preload: false

# https://github.com/piraveenankirupakaran/mapbox-gl-draw-paint-mode
# local download because of removal of css import, latest git version, feature id generation
pin "mapbox-gl-draw-paint-mode", preload: false
pin_all_from "vendor/javascript/mapbox-gl-draw-paint-mode",
  under: "mapbox-gl-draw-paint-mode", preload: false

# https://github.com/maplibre/maplibre-gl-js
pin "maplibre-gl", to: "https://ga.jspm.io/npm:maplibre-gl@4.7.1/dist/maplibre-gl.js"
# https://github.com/maptiler/maptiler-geocoding-control
pin "maptiler-geocoding-control", to: "https://ga.jspm.io/npm:@maptiler/geocoding-control@1.4.1/maplibregl.js"
# render markdown
pin "marked", to: "https://ga.jspm.io/npm:marked@15.0.2/lib/marked.esm.js"
