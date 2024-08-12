import { marked } from 'marked'

// eslint expects variables to get imported, but we load the full lib in header
const turf = window.turf
window.marked = marked

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
    meta += '<br>' + parseFloat(feature.geometry.coordinates[0]).toFixed(6) +
      ', ' + parseFloat(feature.geometry.coordinates[1]).toFixed(6)
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
  document.querySelector('#feature-edit-raw').classList.add('hidden')
  document.querySelector('#feature-edit-ui').classList.add('hidden')
  document.querySelector('#feature-details-body').classList.remove('hidden')
  const modal = document.querySelector('#feature-details-modal')
  modal.classList.remove('expanded')
  modal.classList.add('show')
  modal.dataset.featureFeatureIdValue = feature.id

  document.querySelector('#feature-details-header').innerHTML = ''
  if (feature.properties['marker-image-url']) {
    const imageUrl = feature.properties['marker-image-url'].replace('/icon/', '/image/')
    document.querySelector('#feature-details-header').innerHTML =
      "<a href='" + imageUrl + "' target='_blank'>" +
      "<img id='feature-details-icon' src='" + feature.properties['marker-image-url'] + "'></a>"
  } else if (feature.properties['marker-symbol']) {
    document.querySelector('#feature-details-header').innerHTML =
      "<img id='feature-details-icon' src='/emojis/noto/" + feature.properties['marker-symbol'] + ".png'>"
  }
  document.querySelector('#feature-details-header').innerHTML += featureTitle(feature)
  document.querySelector('#feature-details-meta').innerHTML = featureMeta(feature)
  const desc = marked(feature?.properties?.desc || '')
  document.querySelector('#feature-details-body').innerHTML = desc
}
