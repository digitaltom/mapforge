[![Tests](https://github.com/digitaltom/ourmaps/actions/workflows/rubyonrails.yml/badge.svg)](https://github.com/digitaltom/ourmaps/actions/workflows/rubyonrails.yml)
[![Docker](https://github.com/digitaltom/ourmaps/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/digitaltom/ourmaps/actions/workflows/docker-publish.yml)

# README

## Development Setup

Dependencies:


```
zypper in proj-devel # (libproj-dev) for building rgeo-proj4
zypper in proj # (proj-bin) for running rgeo-proj4
bundle
```


Run develoment server:

```
rails s
```

* MongoDB backend is expected at: `ENV.fetch("MONGO_URL") { "localhost:27017" }`
* Redis (for action cable) is expected at: `ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" }`


### Tasks

Import map from .geojson (samples in db/seeds):

`bin/rake seed:from_file['db/seeds/germany_areas.json']`

More .geojson example files at: https://exploratory.io/map


### Tests

`bundle exec rspec`

### Container build

* Build: `docker build -t ourmaps .`
* Run: `docker run -e SECRET_KEY_BASE=e3c9f2... ourmaps`

Github builds a new container on each commit to `main`: ghcr.io/digitaltom/ourmaps

### Public instance

https://ourmaps.port0.org/

`watchtower` updates the running container each 20 minutes when there is a new image.

Manual update: `podman pull ghcr.io/digitaltom/ourmaps:main; systemctl restart container-ourmaps.service`


