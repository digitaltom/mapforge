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

Import map from .geojson:

`bin/rake seed:from_file['db/seeds/germany_areas.json']`

### Tests

`bundle exec rspec`

### Container build

Build: `docker build -t ourmaps .`
Run: `docker run -e SECRET_KEY_BASE=e3c9f2... ourmaps`
