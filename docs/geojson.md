### Supported feature attributes:

Extending the [Mapbox Simplestyle Spec](https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0), Mapforge supports these feature attributes: 

#### *All* geometries: 

* `title`: Title to show on the map
* `title-min-zoom`: Show title only when zoom level >= value 
* `title-size`: "small", "medium", "large"
* `title-font`: font in format "Calibri,sans-serif" (default)
* `title-color`: font color in format "#000" (default)
* `title-shadow`: font shadow in format "#fff" (default)
* `desc`: Detailed description

#### *Point* geometry: `marker-color` ('transparent' for none), `stroke`, `stroke-width`, `marker-icon`, `marker-symbol` (supports single digit/character, emoji, line-awesome icon name)
* LineString geometry: `stroke-width`, `stroke`
* Polygon geometry: `stroke-width`, `stroke`, `fill`
