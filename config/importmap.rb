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

# vendor
# examples: https://generator.jspm.io/
# https://github.com/mapbox/mapbox-gl-draw
pin "@mapbox/mapbox-gl-draw", to: "https://ga.jspm.io/npm:@mapbox/mapbox-gl-draw@1.4.3/dist/mapbox-gl-draw.js",
preload: false
# https://github.com/zakjan/mapbox-gl-draw-waypoint
pin "mapbox-gl-draw-waypoint",
  to: "https://ga.jspm.io/npm:mapbox-gl-draw-waypoint@1.2.3/dist/mapbox-gl-draw-waypoint.esm.js", preload: false
# https://github.com/piraveenankirupakaran/mapbox-gl-draw-paint-mode
# local download because of removal of css import
pin "mapbox-gl-draw-paint-mode", preload: false # @1.1.1
# https://github.com/maplibre/maplibre-gl-js
#pin "maplibre-gl", to: "https://ga.jspm.io/npm:maplibre-gl@4.5.0/dist/maplibre-gl.js"

# https://github.com/maptiler/maptiler-geocoding-control
pin "maptiler-geocoding-control", to: "https://ga.jspm.io/npm:@maptiler/geocoding-control@1.3.1/maplibregl.js"

pin "@maptiler/elevation-profile-control", to: "https://ga.jspm.io/npm:@maptiler/elevation-profile-control@2.0.0/dist/maptiler-elevation-profile-control.js"
pin "marked", to: "https://ga.jspm.io/npm:marked@13.0.3/lib/marked.esm.js"
pin "@kurkle/color", to: "https://ga.jspm.io/npm:@kurkle/color@0.3.2/dist/color.esm.js"
pin "@maptiler/client", to: "https://ga.jspm.io/npm:@maptiler/client@1.8.1/dist/maptiler-client.mjs"
pin "@maptiler/sdk", to: "https://ga.jspm.io/npm:@maptiler/sdk@2.2.1/dist/maptiler-sdk.mjs"
pin "chart.js", to: "https://ga.jspm.io/npm:chart.js@4.4.3/dist/chart.js"
pin "chart.js/helpers", to: "https://ga.jspm.io/npm:chart.js@4.4.3/helpers/helpers.cjs"
pin "chartjs-plugin-crosshair", to: "https://ga.jspm.io/npm:chartjs-plugin-crosshair@2.0.0/dist/chartjs-plugin-crosshair.js"
pin "chartjs-plugin-zoom", to: "https://ga.jspm.io/npm:chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.js"
pin "events", to: "https://ga.jspm.io/npm:events@3.3.0/events.js"
pin "hammerjs", to: "https://ga.jspm.io/npm:hammerjs@2.0.8/hammer.js"
pin "js-base64", to: "https://ga.jspm.io/npm:js-base64@3.7.7/base64.mjs"
pin "quick-lru", to: "https://ga.jspm.io/npm:quick-lru@7.0.0/index.js"
pin "uuid", to: "https://ga.jspm.io/npm:uuid@10.0.0/dist/esm-browser/index.js"
