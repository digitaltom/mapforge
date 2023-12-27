// https://openlayers.org/workshop/en/vector/style.html


// default styles
// filling of polygon areas
const fill = new ol.style.Fill({
  color: 'rgba(255, 255, 255, 0.3)'
})

const fill_hover = new ol.style.Fill({
  color: 'rgba(255, 255, 255, 0.7)'
})

const stroke = new ol.style.Stroke({
  color: 'green',
  width: 3
})

const stroke_hover = new ol.style.Stroke({
  color: 'darkgreen',
  width: 4
})

const point = new ol.style.Circle({
  radius: 6,
  stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
  fill: new ol.style.Fill({ color: 'green' })
})

const point_hover = new ol.style.Circle({
  radius: 8,
  stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
  fill: new ol.style.Fill({ color: 'darkgreen' })
})


export function vectorStyle(feature, resolution) {
  var style = new ol.style.Style({
    fill: fill,
    stroke: stroke,
    image: point
  })
  return [style]
}


export function hoverStyle(feature, resolution) {
  var style = new ol.style.Style({
    fill: fill_hover,
    stroke: stroke_hover,
    image: point_hover
  })
  return style
}

