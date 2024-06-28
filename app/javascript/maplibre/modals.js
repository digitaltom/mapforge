// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf

function featureTitle (feature) {
  const title = feature?.properties?.title || feature?.properties?.user_title ||
    feature?.properties?.label || feature?.properties?.user_label
  if (!title || title === '') {
    return '<i>No title</i>'
  }
  return title
}

function featureMeta (feature) {
  let meta = feature.id
  if (feature.geometry.type === 'Point') {
    meta += '<br>' + feature.geometry.coordinates[0].toFixed(6) +
      ', ' + feature.geometry.coordinates[1].toFixed(6)
  } else if (feature.geometry.type === 'LineString') {
    const turfLineString = turf.lineString(feature.geometry.coordinates)
    const length = turf.length(turfLineString)
    if (length <= 2) {
      meta += '<br>' + Math.round(length * 1000) + ' m'
    } else {
      // 2 decimals
      meta += '<br>' + Math.round(length * 100) / 100 + ' km'
    }
  } else if (feature.geometry.type === 'MultiLineString') {
    const turfLineString = turf.multiLineString(feature.geometry.coordinates)
    const length = turf.length(turfLineString)
    if (length <= 2) {
      meta += '<br>' + Math.round(length * 1000) + ' m'
    } else {
      // 2 decimals
      meta += '<br>' + Math.round(length * 100) / 100 + ' km'
    }
  } else if (feature.geometry.type === 'Polygon') {
    const turfPolygon = turf.polygon(feature.geometry.coordinates)
    const area = turf.area(turfPolygon)
    if (area < 1000000) {
      meta += '<br>' + (area / 100).toFixed(2) + ' m²'
    } else {
      meta += '<br>' + (area / 1000000).toFixed(2) + ' km²'
    }
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
