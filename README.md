# README

## Development Setup

Install dependencies:


```
zypper in proj-devel # for rgeo-proj4
bundle
```


Run develoment server:

```
rails s
```

### Tasks

Import map from .geojson:

`bin/rake seed:from_file['db/seeds/germany_areas.json']`

### Tests

`bundle exec rspec`

### Container build

Build: `docker build -t ourmaps .`
Run: `docker run -e SECRET_KEY_BASE=e3c9f2... ourmaps`
