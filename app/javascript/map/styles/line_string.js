import { title } from 'map/styles'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export function lineStringStyle (feature, resolution) {
  const stroke = new ol.style.Stroke({
    color: feature.get('stroke') || 'green',
    width: feature.get('stroke-width') || 3
  })

  return new ol.style.Style({
    stroke
  })
}

export function lineStringSketchStyle (feature, resolution) {
  const stroke = new ol.style.Stroke({
    color: feature.get('stroke') || 'darkgreen',
    width: feature.get('stroke-width') || 4,
    lineDash: [10, 10]
  })

  return new ol.style.Style({
    stroke
  })
}

export function lineStringHoverStyle (feature, resolution) {
  const stroke = new ol.style.Stroke({
    color: feature.get('stroke') || 'darkgreen',
    width: (feature.get('stroke-width') + 1) || 4
  })

  return new ol.style.Style({
    stroke,
    text: title(feature)
  })
}
