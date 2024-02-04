import { title } from 'map/styles/title'
import { hexToRgb } from 'map/functions'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const strokeWidth = 3
let strokeCol = '10, 135, 10'
let strokeHoverCol = '10, 100, 10'
let fillCol = '10, 135, 10'

export function polygonStyle (feature, resolution) {
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeCol = hexToRgb(feature.get('stroke')) }

  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeWidth)
  })
  const fillOpacity = feature.get('fill-opacity') || '0.3'
  if (feature.get('fill') && feature.get('fill').startsWith('#')) { fillCol = hexToRgb(feature.get('fill')) }
  const fill = new ol.style.Fill({
    color: 'rgba(' + fillCol + ', ' + fillOpacity + ')'
  })

  return new ol.style.Style({
    stroke,
    fill,
    text: title(feature, resolution, false, 0)
  })
}

export function polygonSketchStyle (feature, resolution) {
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeHoverCol = hexToRgb(feature.get('stroke')) }

  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeHoverCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeWidth) + 2,
    lineDash: [10, 10]
  })
  const fillOpacity = feature.get('fill-opacity') || '0.7'
  if (feature.get('fill') && feature.get('fill').startsWith('#')) { fillCol = hexToRgb(feature.get('fill')) }
  const fill = new ol.style.Fill({
    color: 'rgba(' + fillCol + ', ' + fillOpacity + ')'
  })

  return new ol.style.Style({
    stroke, fill
  })
}

export function polygonHoverStyle (feature, resolution) {
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeHoverCol = hexToRgb(feature.get('stroke')) }

  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeHoverCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeWidth) + 2
  })
  const fillOpacity = feature.get('fill-opacity') || '0.7'
  if (feature.get('fill') && feature.get('fill').startsWith('#')) { fillCol = hexToRgb(feature.get('fill')) }
  const fill = new ol.style.Fill({
    color: 'rgba(' + fillCol + ', ' + fillOpacity + ')'
  })

  return new ol.style.Style({
    stroke,
    fill,
    text: title(feature, resolution, true, 0)
  })
}
