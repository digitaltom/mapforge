// https://openlayers.org/workshop/en/vector/style.html
import { pointStyle, pointHoverStyle } from 'map/styles/point'
import { lineStringStyle, lineStringHoverStyle, lineStringSketchStyle } from 'map/styles/line_string'
import { polygonStyle, polygonHoverStyle, polygonSketchStyle } from 'map/styles/polygon'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

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
      // In case a modify interaction is active on a LineString/Polygon,
      // it renders a Point on the border, we need to style that here
      if (feature.values_.features) {
        feature = feature.values_.features[0]
        if (feature.getGeometry().getType() !== 'Point') {
          // Pointstyle for modifying LineStrings + Polygons
          const templateFeature = new ol.Feature(new ol.geom.Point([0, 0]))
          return pointHoverStyle(templateFeature, resolution)
        }
      }
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
