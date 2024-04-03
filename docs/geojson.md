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
* `marker-symbol`: Taken as text/emoji, emoji list: https://emojipedia.org/google/15.1
* `marker-icon`: URL pointing to icon image. Can point to a Mapforge hosted image like /image/<id>

#### *LineString* geometry: 

* `stroke-width`: width of the line (default: 3)
* `stroke`: line color (default: 'darkgreen')
* `stroke-opacity`: opacity of the line (default: 1.0)

#### *Polygon* geometry: 

* `stroke-width`: width of the line (default: 3)
* `stroke`: line color (default: 'darkgreen')
* `stroke-opacity`: opacity of the line (default: 1.0)
* `fill`: fill color (default: "#0A870A", green)
* `fill-opacity`: opacity of the filling (default: 0.3)
