// https://openlayers.org/workshop/en/vector/style.html
import { pointStyle, pointHoverStyle } from 'map/styles/point'
import { lineStringStyle, lineStringHoverStyle, lineStringSketchStyle } from 'map/styles/line_string'
import { polygonStyle, polygonHoverStyle, polygonSketchStyle } from 'map/styles/polygon'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export function title (feature) {
  return new ol.style.Text({
    text: feature.get('title') || feature.getId(),
    font: '15px Calibri,sans-serif',
    fill: new ol.style.Fill({ color: '#000' }),
    stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
    offsetY: -17
  })
}

export function vectorStyle (feature, resolution) {
  switch (feature.getGeometry().getType()) {
    case 'Point':
      return pointStyle(feature, resolution)
    case 'LineString':
      return lineStringStyle(feature, resolution)
    case 'Polygon':
    case 'MultiPolygon':
      return polygonStyle(feature, resolution)
    default:
      console.log('Unsupported feature type: ' + feature.getGeometry().getType())
      return new ol.style.Style({ })
  }
}

export function sketchStyle (feature, resolution) {
  switch (feature.getGeometry().getType()) {
    case 'Point':
      return pointHoverStyle(feature, resolution)
    case 'LineString':
      return lineStringSketchStyle(feature, resolution)
    case 'Polygon':
    case 'MultiPolygon':
      return polygonSketchStyle(feature, resolution)
    default:
      console.log('Unsupported feature type: ' + feature.getGeometry().getType())
      return new ol.style.Style({ })
  }
}

export function hoverStyle (feature, resolution) {
  switch (feature.getGeometry().getType()) {
    case 'Point':
      // in case a modify interaction is active, those feautures
      // are temporary copies in a differenct format
      if (feature.values_.features) { feature = feature.values_.features[0] }
      return pointHoverStyle(feature, resolution)
    case 'LineString':
      return lineStringHoverStyle(feature, resolution)
    case 'Polygon':
      return polygonHoverStyle(feature, resolution)
    default:
      console.log('Unsupported feature type: ' + feature.getGeometry().getType())
      return new ol.style.Style({ })
  }
}
