# Pin npm packages by running ./bin/importmap pin <npm module name>@<version> --from jspm|unpkg|jsdelivr --download
# https://github.com/rails/importmap-rails

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true
pin "@rails/actioncable", to: "actioncable.esm.js", preload: true

pin "deck.gl", to: "https://unpkg.com/deck.gl/dist.min.js", preload: true

pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/channels", under: "channels"

pin_all_from "app/javascript/ol", under: "ol"
pin_all_from "app/javascript/helpers", under: "helpers"

# page initializers
pin "frontpage"
pin "map"
pin "deck"
pin "maplibre"
