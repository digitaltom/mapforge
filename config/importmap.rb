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

# https://github.com/piraveenankirupakaran/mapbox-gl-draw-paint-mode
# free hand draw; local download because of removal of css import, latest git version, feature id generation
pin "mapbox-gl-draw-paint-mode", preload: false
pin_all_from "vendor/javascript/mapbox-gl-draw-paint-mode",
  under: "mapbox-gl-draw-paint-mode", preload: false

# https://github.com/maplibre/maplibre-gl-js
pin "maplibre-gl" # @5.0.0
# https://github.com/maplibre/maplibre-gl-geocoder
pin "maplibre-gl-geocoder", to: "https://ga.jspm.io/npm:@maplibre/maplibre-gl-geocoder@1.7.0/dist/maplibre-gl-geocoder.mjs"

# render markdown
pin "marked", to: "https://ga.jspm.io/npm:marked@15.0.5/lib/marked.esm.js"

# https://github.com/mapbox/mapbox-gl-draw
pin "@mapbox/mapbox-gl-draw", to: "@mapbox--mapbox-gl-draw.js", preload: false # @1.5.0
pin "@mapbox/geojson-area", to: "@mapbox--geojson-area.js", preload: false # @0.2.2
pin "@mapbox/geojson-normalize", to: "@mapbox--geojson-normalize.js", preload: false # @0.0.1
pin "@mapbox/point-geometry", to: "@mapbox--point-geometry.js", preload: false # @1.1.0
pin "fast-deep-equal", preload: false # @3.1.3
pin "nanoid/non-secure", to: "nanoid--non-secure.js", preload: false # @5.0.9
pin "wgs84", preload: false # @0.0.0

# Animations for frontpage: https://github.com/michalsnik/aos
pin "aos", preload: false # @2.3.4
