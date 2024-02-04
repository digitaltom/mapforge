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

#### *Point* geometry: 

* `marker-color`: circle color (default "green", 'transparent' for none),
* `stroke`: circle border color (default "white", 'transparent' for none),
* `marker-size`: "small", "medium", "large"
* `marker-symbol`: Taken as text/emoji if shorter than 3 characters, else
                   an icon name from [lineawesome](https://icons8.com/line-awesome) ([mapping](https://github.com/digitaltom/mapforge/blob/main/app/javascript/map/styles/font_mappings.js))

#### *LineString* geometry: 

* `stroke-width`: width of the line (default: 3)
* `stroke`: line color (default: 'darkgreen')
* `stroke-opacity`: opacity of the line (default: 1.0)

#### *Polygon* geometry: 

* `stroke-width`,
* `stroke`, `fill`
