import { title } from 'map/styles'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export function polygonStyle (feature, resolution) {
  const stroke = new ol.style.Stroke({
    color: feature.get('stroke') || 'green',
    width: feature.get('stroke-width') || 3
  })
  const fill = new ol.style.Fill({
    color: feature.get('fill') || 'rgba(255, 255, 255, 0.3)'
  })

  return new ol.style.Style({
    stroke, fill
  })
}

export function polygonSketchStyle (feature, resolution) {
  const stroke = new ol.style.Stroke({
    color: feature.get('stroke') || 'green',
    width: (feature.get('stroke-width') + 1) || 4,
    lineDash: [10, 10]
  })
  const fill = new ol.style.Fill({
    color: feature.get('fill') || 'rgba(255, 255, 255, 0.7)'
  })

  return new ol.style.Style({
    stroke, fill
  })
}

export function polygonHoverStyle (feature, resolution) {
  const stroke = new ol.style.Stroke({
    color: feature.get('stroke') || 'darkgreen',
    width: (feature.get('stroke-width') + 1) || 4
  })
  const fillHover = new ol.style.Fill({
    color: 'rgba(255, 255, 255, 0.7)'
  })

  return new ol.style.Style({
    stroke,
    fill: fillHover,
    text: title(feature)
  })
}
