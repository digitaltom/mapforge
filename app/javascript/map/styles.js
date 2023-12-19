// https://openlayers.org/workshop/en/vector/style.html
import { Style, Fill, Stroke, Circle } from 'ol/style'

export function vectorStyle(feature) {
  var style = new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: 'green',
      width: 4
    }),
    image: new Circle({
      radius: 8,
      stroke: new Stroke({
        color: 'white',
        width: 3
      }),
      fill: new Fill({
        color: 'green'
      })
    })
  });
  return [style];
}
