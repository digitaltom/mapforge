import { title } from 'map/styles/title'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const pointSizes = { small: 6, medium: 8, large: 11, symbol: 13 }
const symbolSizes = { small: 10, medium: 15, large: 20 }

function circleStyle (feature, resolution) {
  const sizes = feature.get('marker-symbol') ? symbolSizes : pointSizes
  return new ol.style.Circle({
    radius: sizes[feature.get('marker-size')] || sizes.medium,
    stroke: new ol.style.Stroke({ color: feature.get('stroke') || 'white', width: feature.get('stroke-width') || 2 }),
    fill: new ol.style.Fill({ color: (feature.get('marker-color') || 'green') })
  })
}

function circleHoverStyle (feature, resolution) {
  const sizes = feature.get('marker-symbol') ? symbolSizes : pointSizes
  return new ol.style.Circle({
    radius: (sizes[feature.get('marker-size')] || sizes.medium) + 2,
    stroke: new ol.style.Stroke({ color: feature.get('stroke') || 'white', width: feature.get('stroke-width') || 2 }),
    fill: new ol.style.Fill({ color: (feature.get('marker-color') || 'green') })
  })
}

function symbolStyle (feature, resolution) {
  const symbol = feature.get('marker-symbol')
  const size = symbolSizes[feature.get('marker-size')] || symbolSizes.medium

  return new ol.style.Style({
    // https://openlayers.org/en/latest/apidoc/module-ol_style_Text.html
    text: new ol.style.Text({
      text: symbol,
      font: 'bold ' + (size * 2 - 5) + 'px "Noto Color Emoji"',
      textBaseline: 'middle',
      fill: new ol.style.Fill({
        color: 'white' // Set the color of the text
      })
    })
  })
}

function symbolHoverStyle (feature, resolution) {
  const symbol = feature.get('marker-symbol')
  const size = (symbolSizes[feature.get('marker-size')] || symbolSizes.medium) + 2

  return new ol.style.Style({
    text: new ol.style.Text({
      text: symbol,
      font: 'bold ' + (size * 2 - 5) + 'px "Noto Color Emoji"',
      textBaseline: 'middle',
      fill: new ol.style.Fill({
        color: 'white' // Set the color of the text
      })
    })
  })
}

function iconStyle (feature, resolution) {
  const size = symbolSizes[feature.get('marker-size')] || symbolSizes.medium
  return new ol.style.Icon({
    src: feature.get('marker-icon'),
    width: size + 10
  })
}

export function pointStyle (feature, resolution) {
  const circle = new ol.style.Style({
    image: circleStyle(feature, resolution),
    text: title(feature, resolution)
  })

  if (feature.get('marker-icon')) {
    const icon = new ol.style.Style({
      image: iconStyle(feature, resolution)
    })
    return [icon, circle]
  } else if (feature.get('marker-symbol')) {
    return [circle, symbolStyle(feature, resolution)]
  } else {
    return circle
  }
}

export function pointHoverStyle (feature, resolution) {
  const circle = new ol.style.Style({
    image: circleHoverStyle(feature, resolution),
    text: title(feature, resolution, true)
  })

  if (feature.get('marker-icon')) {
    const icon = new ol.style.Style({
      image: iconStyle(feature, resolution)
    })
    return [circle, icon]
  } else if (feature.get('marker-symbol')) {
    return [circle, symbolHoverStyle(feature, resolution)]
  } else {
    return circle
  }
}
