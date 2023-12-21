// https://openlayers.org/workshop/en/vector/style.html

export function vectorStyle(feature) {
  var style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 4
    }),
    image: new ol.style.Circle({
      radius: 8,
      stroke: new ol.style.Stroke({
        color: 'white',
        width: 3
      }),
      fill: new ol.style.Fill({
        color: 'green'
      })
    })
  });
  return [style];
}
