// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

export function showFeatureDetails (feature) {
  document.querySelector('#feature-details-modal').style.display = 'block'
  let desc = feature?.properties?.desc
  const title = feature?.properties?.title || feature?.properties?.label
  if (feature.geometry.type === 'LineString') {
    const turfLineString = turf.lineString(feature.geometry.coordinates)
    const length = turf.length(turfLineString)
    desc += '<br>Length: ' + Math.round(length * 1000) + 'm'
  }
  if (feature.geometry.type === 'Polygon') {
    const turfPolygon = turf.polygon(feature.geometry.coordinates)
    const area = turf.area(turfPolygon)
    desc += '<br>Area: ' + (area / 1000000).toFixed(2) + ' km²'
  }
  document.querySelector('#feature-details-header').innerHTML = title
  document.querySelector('#feature-details-body').innerHTML = desc
}
