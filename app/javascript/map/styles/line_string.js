import { title } from 'map/styles/title'
import { hexToRgb } from 'helpers/functions'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const strokeWidth = 3

export function lineStringStyle (feature, resolution) {
  let strokeCol = '10, 135, 10'
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeCol = hexToRgb(feature.get('stroke')) }
  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeWidth)
  })

  return new ol.style.Style({
    stroke,
    text: title(feature, resolution, false, 0)
  })
}

export function lineStringSketchStyle (feature, resolution) {
  let strokeCol = '10, 100, 10'
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeCol = hexToRgb(feature.get('stroke')) }
  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeWidth) + 2,
    lineDash: [10, 10]
  })

  return new ol.style.Style({
    stroke
  })
}

export function lineStringHoverStyle (feature, resolution) {
  let strokeCol = '10, 100, 10'
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeCol = hexToRgb(feature.get('stroke')) }
  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeWidth) + 2
  })

  return new ol.style.Style({
    stroke,
    text: title(feature, resolution, true, 0)
  })
}
