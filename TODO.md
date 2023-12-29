# TODO + Features

## TODO:

* popover position + layout
  * handle popover on map move/zoom
  * disable popup in non-select mode
  * show popover on click for mobile
* SimpleCov.minimum_coverage 100
* Handle 'changeproperties' in undo/redo
* CSS framework, https://www.simplethread.com/how-to-create-a-new-rails-7-app-with-tailwind/
* use bbox to only load visible features when moving/zooming map
  * only update features received by action_cable that are visible
* dev Procfile?
* Admin view: Map list with screenshots
* About page: https://icons8.com/icons, https://icons8.com/line-awesome
* Do we need Stimulus?
* domain options: mapforge.org, ourmaps.org, mapcrafting.org finemaps.org


## Feature Ideas

* New map gets private + public (read-only) url
  * validate access on update
  * add view location to shareable public url
  * share button
* New feature type text (is this a point with 'hide icon'?)
* Map properties: Name, description
  * Initial location center, zoom
  * Base map selector (+ min/max zoom)
* Editor for feature properties (name, description, style)
  * Select icon for pointer, icon upload
* Image upload as feature property, read geolocation
* Multi-select (change all at once)
* Filter view by feature group / category
* Map Tour (define steps with descriptions) (ol-ext: Storymap control)
* geojson import / export
* document geojson spec extension
* Text listing of map features
* Show pointer or connected state of other users


## Data Integrations:

* On uploading geojson, define how property keys map to ourmaps properties
* Connect to external APIs, define mapping
  * Provide example json apis with moving points features
* Upload spreadsheet
