[![Tests](https://github.com/digitaltom/mapforge/actions/workflows/ci.yml/badge.svg)](https://github.com/digitaltom/mapforge/actions/workflows/ci.yml)
[![Docker](https://github.com/digitaltom/mapforge/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/digitaltom/mapforge/actions/workflows/docker-publish.yml)
[![Code Climate](https://api.codeclimate.com/v1/badges/b56fa0cb960a90502022/maintainability)](https://codeclimate.com/github/digitaltom/mapforge)
[![Coverage Status](https://coveralls.io/repos/github/digitaltom/mapforge/badge.svg?branch=main)](https://coveralls.io/github/digitaltom/mapforge?branch=main)

# README

## Geojson

This app supports and stores data in an extended version of the [geojson](https://macwright.com/2015/03/23/geojson-second-bite.html)
[mapbox simplestyle spec](https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0).
See [docs/geojson.md](docs/geojson.md) for supported attributes.

## Development Setup

### Install dependencies:

```
zypper in proj-devel # (libproj-dev) for building rgeo-proj4
zypper in proj # (proj-bin) for running rgeo-proj4
zypper in npm # for running eslint
bundle
```

### Run develoment server:

`bin/thrust rails server`

* Put map provider keys (MAPTILER_KEY, MAPBOX_KEY) into `.env.development`
* MongoDB backend is expected at: `ENV.fetch("MONGO_URL") { "localhost:27017" }`
* Redis (for action cable) is expected at: `ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" }`
* To import the initial frontpage, run: `bin/rake seed:frontpage`

### Base maps

Available base maps are defined in app/javascript/map/layers/background_maps.js.
There are also examples for using maptiler vector maps with custom styles, for example
created with [maputnik](https://maplibre.org/maputnik/).


## Rake tasks

* Create map from a mapforge export:

  `bin/rake seed:mapforge_file['db/seeds/examples/fosdem.json']`

* Create map from geojson (samples in db/seeds):

  `bin/rake seed:geojson_file['db/seeds/examples/germany_areas.json']`

  More geojson example files at: https://exploratory.io/map

* Take screenshots of existing maps for preview:

  `bin/rake maps:screenshots` (use MAPFORGE_HOST to set the host)

* Animate a marker along a line: `bin/rake animation:path[<map_id>, <line_id>, <point_id>]`


## Tests

Linters:
  * `bin/rubocop`
  * `npm install; npm run lint:css; npm run lint:js`

Fix style with eslint: `npm run fix:js`

Specs: `bundle exec rspec`


## Container build

* Build: `sudo podman build -t mapforge --network=host .`
* Run: `podman run -e SECRET_KEY_BASE=e3c9f2... mapforge`

Github builds a new container on each commit to `main`: ghcr.io/digitaltom/mapforge
