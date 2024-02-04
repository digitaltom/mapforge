import { map } from 'map/map'

// eslint expects ol to get imported, but we load the full lib in header
const ol = window.ol

export function title (feature, resolution, hover = false) {
  if (!feature.get('title')) { return null }
  if (feature.get('title-min-zoom') &&
      map.getView().getZoom() < feature.get('title-min-zoom')) { return null }

  const font = feature.get('title-font') || 'Calibri,sans-serif'
  let size = 1
  switch (feature.get('title-size')) {
    case 'small':
      size = 0.7
      break
    case 'large':
      size = 1.5
      break
  }
  if (hover) { size += 0.3 }

  return new ol.style.Text({
    text: feature.get('title'),
    font: size + 'em ' + font,
    textBaseline: 'middle',
    fill: new ol.style.Fill({ color: feature.get('title-color') || '#000' }),
    stroke: new ol.style.Stroke({ color: feature.get('title-shadow') || '#fff', width: 3 }),
    offsetY: -17
  })
}
