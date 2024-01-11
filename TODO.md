# TODO + Features

## TODO:

* SimpleCov.minimum_coverage 100
* read map-keys from env
* attributions
* seperate definition of mobile + desktop style/behavior
* Handle 'changeproperties' in undo/redo
* handle remote update of map properties

First release:

* About page: https://icons8.com/icons, https://icons8.com/line-awesome
* domain options: mapforge.org, ourmaps.org, mapcrafting.org finemaps.org
* plausible
* release on mapforge.org


## Feature Ideas

* SimpleStyle Spec, mapbox: https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0
  * document geojson spec extension
* CSS framework, https://www.simplethread.com/how-to-create-a-new-rails-7-app-with-tailwind/
* Map list
  * with screenshots
* Vector maps:
  * https://protomaps.com/, https://docs.protomaps.com/pmtiles/openlayers
  * vector map: https://openlayers.org/workshop/en/vectortile/bright.html
* New map gets private + public (read-only) url
  * validate access on update
  * add view location to shareable public url
  * share button
* Use bbox to only load visible features when moving/zooming map
  * only update features received by action_cable that are visible
  * store geometry server side as EPSG:4326
* Supported shapes
  * New feature type text (point without icon)
  * New feature free draw (line with 'shift'), downsample points
  * Image upload as feature property, read geolocation
  * popup: https://docs.maptiler.com/openlayers/examples/choropleth-geojson/
* Map properties: Name, description
  * Initial location center, zoom
  * Base map selector (+ min/max zoom), Stadia Maps
* Editor for feature properties (name, description, style)
  * Select icon for pointer, icon upload
* Location: Pulsating icon with radius of accuracy
  * Multi click: Loader -> Locate (follow mode) -> unfollow on map move -> unlocate
  * show accuracy: https://openlayers.org/workshop/en/mobile/geolocation.html
* Legend wth scale
* geojson import / export
  * drop geojson: https://openlayers.org/workshop/en/vector/drag-n-drop.html
* Layers
  * Text listing of map features
* Login
   * validate client access to map id
* Search locations:
  * https://viglino.github.io/ol-ext/examples/search/map.control.searchnominatim.html
  * https://docs.maptiler.com/openlayers/examples/geocoding-control/
* Multi-select (change all at once)
* Filter view by feature group / category / layer
* Map Tour (define steps with descriptions) (ol-ext: Storymap control)
* Show pointer or connected state of other users
* Debug mode: show coords, sizes, boundaries on map (like editor.mapset.io)
  * show line lengths in edit mode
* Long touch?
* Draw touch: https://viglino.github.io/ol-ext/examples/mobile/map.interaction.drawtouch.html


## Data Integrations:

* On uploading geojson, define how property keys map to ourmaps properties
* Connect to external APIs, define mapping
  * Provide example json apis with moving points features
* Upload spreadsheet
