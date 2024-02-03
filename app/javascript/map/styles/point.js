import { title } from 'map/styles'
import { symbolMappings } from 'map/styles/font_mappings'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const pointSizes = { small: 6, medium: 8, large: 10, symbol: 13 }

function circleStyle (feature, resolution) {
  return new ol.style.Circle({
    radius: pointSizes[feature.get('marker-size')] || 8,
    stroke: new ol.style.Stroke({ color: feature.get('stroke') || 'white', width: feature.get('stroke-width') || 2 }),
    fill: new ol.style.Fill({ color: (feature.get('marker-color') || 'green') })
  })
}

function circleHoverStyle (feature, resolution) {
  return new ol.style.Circle({
    radius: (pointSizes[feature.get('marker-size')] || 8) + 2,
    stroke: new ol.style.Stroke({ color: feature.get('stroke') || 'white', width: feature.get('stroke-width') || 2 }),
    fill: new ol.style.Fill({ color: (feature.get('marker-color') || 'green') })
  })
}

function symbolStyle (feature, resolution) {
  let symbol = symbolMappings[feature.get('marker-symbol')]
  if (feature.get('marker-symbol').length <= 2) { symbol = feature.get('marker-symbol') }
  return new ol.style.Style({
    // https://openlayers.org/en/latest/apidoc/module-ol_style_Text.html
    text: new ol.style.Text({
      text: symbol,
      font: 'bold 21px "Line Awesome Free"',
      textBaseline: 'middle',
      fill: new ol.style.Fill({
        color: 'white' // Set the color of the text
      })
    })
  })
}

function symbolHoverStyle (feature, resolution) {
  let symbol = symbolMappings[feature.get('marker-symbol')]
  if (feature.get('marker-symbol').length <= 2) { symbol = feature.get('marker-symbol') }
  return new ol.style.Style({
    text: new ol.style.Text({
      text: symbol,
      font: 'bold 23px "Line Awesome Free"',
      textBaseline: 'middle',
      fill: new ol.style.Fill({
        color: 'white' // Set the color of the text
      })
    })
  })
}

function iconStyle (feature, resolution) {
  return new ol.style.Icon({
    src: feature.get('marker-icon'),
    imgSize: [12, 12]
  })
}

export function pointStyle (feature, resolution) {
  const circle = new ol.style.Style({
    image: circleStyle(feature, resolution),
    text: title(feature)
  })

  if (feature.get('marker-icon')) {
    const icon = new ol.style.Style({
      image: iconStyle(feature, resolution)
    })
    return [circle, icon]
  } else if (feature.get('marker-symbol')) {
    feature.set('marker-size', 'symbol')
    return [circle, symbolStyle(feature, resolution)]
  } else {
    return circle
  }
}

export function pointHoverStyle (feature, resolution) {
  const circle = new ol.style.Style({
    image: circleHoverStyle(feature, resolution),
    text: title(feature)
  })

  if (feature.get('marker-icon')) {
    const icon = new ol.style.Style({
      image: iconStyle(feature, resolution)
    })
    return [circle, icon]
  } else if (feature.get('marker-symbol')) {
    feature.set('marker-size', 'symbol')
    return [circle, symbolHoverStyle(feature, resolution)]
  } else {
    return circle
  }
}
