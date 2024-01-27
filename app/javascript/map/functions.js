// eslint expects variables to get imported, but we load the full lib in header
const ol = window.ol

// from https://openlayers.org/en/latest/examples/measure.html
export function formatLength (line) {
  const length = ol.sphere.getLength(line)
  let output
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km'
  } else {
    output = Math.round(length * 100) / 100 + ' ' + 'm'
  }
  return output
}

export function formatArea (polygon) {
  const area = ol.sphere.getArea(polygon)
  let output
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>'
  } else {
    output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>'
  }
  return output
}
