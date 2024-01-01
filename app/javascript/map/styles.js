// https://openlayers.org/workshop/en/vector/style.html

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

// default styles
// filling of polygon areas
const fill = new ol.style.Fill({
  color: 'rgba(255, 255, 255, 0.3)'
})

const fillHover = new ol.style.Fill({
  color: 'rgba(255, 255, 255, 0.7)'
})

const stroke = new ol.style.Stroke({
  color: 'green',
  width: 3
})

const strokeHover = new ol.style.Stroke({
  color: 'darkgreen',
  width: 4
})

const point = new ol.style.Circle({
  radius: 6,
  stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
  fill: new ol.style.Fill({ color: 'green' })
})

const pointHover = new ol.style.Circle({
  radius: 8,
  stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
  fill: new ol.style.Fill({ color: 'darkgreen' })
})

function title (feature) {
  return new ol.style.Text({
    text: feature.get('title') || feature.getId(),
    font: '15px Calibri,sans-serif',
    fill: new ol.style.Fill({ color: '#000' }),
    stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
    offsetY: -17
  })
}

export function vectorStyle (feature, resolution) {
  const style = new ol.style.Style({
    fill,
    stroke,
    image: point
  })
  return [style]
}

export function hoverStyle (feature, resolution) {
  const style = new ol.style.Style({
    fill: fillHover,
    stroke: strokeHover,
    image: pointHover,
    text: title(feature)
  })
  return style
}
