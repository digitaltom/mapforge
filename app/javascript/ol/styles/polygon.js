import { title } from 'ol/styles/title'
import { hexToRgb } from 'helpers/functions'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol
const strokeDefaultWidth = 3
const strokeDefaultCol = '10, 135, 10'
const strokeDefaultHoverCol = '10, 100, 10'
const fillDefaultCol = '10, 135, 10'

export function polygonStyle (feature, resolution) {
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  let strokeCol = strokeDefaultCol
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeCol = hexToRgb(feature.get('stroke')) }

  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeDefaultWidth)
  })
  const fillOpacity = feature.get('fill-opacity') || '0.3'
  let fillCol = fillDefaultCol
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
  let strokeHoverCol = strokeDefaultHoverCol
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeHoverCol = hexToRgb(feature.get('stroke')) }

  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeHoverCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeDefaultWidth) + 2,
    lineDash: [10, 10]
  })
  const fillOpacity = feature.get('fill-opacity') || '0.7'
  let fillCol = fillDefaultCol
  if (feature.get('fill') && feature.get('fill').startsWith('#')) { fillCol = hexToRgb(feature.get('fill')) }
  const fill = new ol.style.Fill({
    color: 'rgba(' + fillCol + ', ' + fillOpacity + ')'
  })
  console.log(fillCol)

  return new ol.style.Style({
    stroke, fill
  })
}

export function polygonHoverStyle (feature, resolution) {
  const strokeOpacity = feature.get('stroke-opacity') || '1.0'
  let strokeHoverCol = strokeDefaultHoverCol
  if (feature.get('stroke') && feature.get('stroke').startsWith('#')) { strokeHoverCol = hexToRgb(feature.get('stroke')) }

  const stroke = new ol.style.Stroke({
    color: 'rgba(' + strokeHoverCol + ', ' + strokeOpacity + ')',
    width: parseInt(feature.get('stroke-width') || strokeDefaultWidth) + 2
  })
  const fillOpacity = feature.get('fill-opacity') || '0.7'
  let fillCol = fillDefaultCol
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
