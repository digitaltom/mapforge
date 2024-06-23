// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

function featureTitle (feature) {
  const title = feature?.properties?.title || feature?.properties?.label
  if (!title || title === '') {
    return '<i>No title</i>'
  }
  return title
}

function featureMeta (feature) {
  let meta = feature.id
  if (feature.geometry.type === 'Point') {
    meta += '<br>' + feature.geometry.coordinates
  }
  if (feature.geometry.type === 'LineString') {
    const turfLineString = turf.lineString(feature.geometry.coordinates)
    const length = turf.length(turfLineString)
    meta += '<br>' + Math.round(length * 1000) + 'm'
  }
  if (feature.geometry.type === 'Polygon') {
    const turfPolygon = turf.polygon(feature.geometry.coordinates)
    const area = turf.area(turfPolygon)
    meta += '<br>' + (area / 1000000).toFixed(2) + ' km²'
  }
  return meta
}

export function showFeatureDetails (feature) {
  document.querySelector('#feature-details-modal').style.display = 'block'
  const desc = feature?.properties?.desc
  document.querySelector('#feature-details-header').innerHTML = featureTitle(feature)
  document.querySelector('#feature-details-meta').innerHTML = featureMeta(feature)
  if (desc) { document.querySelector('#feature-details-body').innerHTML = desc }
}