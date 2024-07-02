### Supported feature attributes:

Extending the [Mapbox Simplestyle Spec](https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0), Mapforge supports these feature attributes: 

#### *All* geometries: 

* `label`: Label to show on the map (no emoji support)
* `label-size`: "small", "medium", "large"
* `label-font`: font in format "Open Sans Regular,Arial Unicode MS Regular" (default)
* `label-color`: font color in format "#000" or "black" (default)
* `label-shadow`: font shadow in format "#fff" or "white" (default)
* `title`: Title
* `desc`: Detailed description

#### *Point* geometry: 

* `marker-color`: circle color (default "green", 'transparent' for none)
* `stroke-width`: width of the circle border line (default: 2)
* `stroke`: circle border color (default "white", 'transparent' for none)
* `marker-size`: radius of the marker (default: 6, with 'marker-symbol': 12 )
* `marker-symbol`: Taken as text/emoji, emoji list: https://emojipedia.org/google/15.1
* `marker-image-url`: URL pointing to icon image. Can point to a Mapforge hosted image like /image/<id>

#### *LineString* geometry: 

* `stroke-width`: width of the line (default: 3)
* `stroke`: line color (default: 'darkgreen')
* `stroke-opacity`: opacity of the line (default: 0.8)

#### *Polygon* geometry: 

* `stroke-width`: width of the line (default: 3)
* `stroke`: line color (default: 'darkgreen')
* `stroke-opacity`: opacity of the line (default: 1.0)
* `fill`: fill color (default: "#0A870A", green)
* `fill-extrusion-color`: color of the extrusion (default: green),
* `fill-extrusion-height`: height in m,
* `fill-extrusion-base`: ground distance in m (default: 0),
