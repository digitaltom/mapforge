import { marked } from 'marked'
import * as functions from 'helpers/functions'
import * as dom from 'helpers/dom'

window.marked = marked

let isDragging = false
let dragStartY, dragStartModalHeight

function featureTitle (feature) {
  const title = feature?.properties?.title || feature?.properties?.user_title ||
    feature?.properties?.label || feature?.properties?.user_label
  if (!title || title === '') {
    return '<i>No title</i>'
  }
  return title
}

function featureMeta (feature) {
  const turf = window.turf
  let meta = ''
  if (feature.geometry.type === 'LineString') {
    const turfLineString = turf.lineString(feature.geometry.coordinates)
    const length = turf.length(turfLineString)
    if (length <= 2) {
      meta = Math.round(length * 1000) + ' m'
    } else {
      // 2 decimals
      meta = Math.round(length * 100) / 100 + ' km'
    }
  } else if (feature.geometry.type === 'MultiLineString') {
    const turfLineString = turf.multiLineString(feature.geometry.coordinates)
    const length = turf.length(turfLineString)
    if (length <= 2) {
      meta = Math.round(length * 1000) + ' m'
    } else {
      // 2 decimals
      meta = Math.round(length * 100) / 100 + ' km'
    }
  } else if (feature.geometry.type === 'Polygon') {
    const turfPolygon = turf.polygon(feature.geometry.coordinates)
    const area = turf.area(turfPolygon)
    if (area < 100000) {
      meta = area.toFixed(0) + ' m²'
    } else {
      meta = (area / 1000000).toFixed(2) + ' km²'
    }
  }
  return meta
}

export function showFeatureDetails (feature) {
  dom.hideElements(['#feature-edit-raw', '#edit-button-raw', '#feature-edit-ui'])
  functions.e('#edit-buttons button', (e) => { e.classList.remove('active') })
  dom.showElements('#feature-details-body')
  const modal = document.querySelector('#feature-details-modal')
  modal.classList.remove('expanded')
  modal.classList.add('show')
  modal.scrollTo(0, 0)
  modal.setAttribute('data-map--feature-modal-feature-id-value', feature.id)
  modal.setAttribute('data-map--feature-edit-feature-id-value', feature.id)

  functions.addEventListeners(modal, ['mousedown', 'touchstart', 'dragstart'], (event) => {
    if (isDragging) return
    // don't break multiline select -> disable drag on textarea
    if (event.target.tagName.toLowerCase() === 'textarea' &&
      !functions.isTouchDevice()) return

    isDragging = true
    dragStartY = event.clientY || event.touches[0].clientY
    dragStartModalHeight = modal.offsetHeight
    modal.style.cursor = 'move'
  })

  // Allow to drag up/down modal on touch devices
  functions.addEventListeners(modal, ['mousemove', 'touchmove', 'drag'], (event) => {
    if (!isDragging) return

    const dragY = event.clientY || event.touches[0].clientY
    const y = dragY - dragStartY
    modal.classList.remove('modal-pull-up')
    modal.classList.remove('modal-pull-up-half')
    modal.classList.remove('modal-pull-down')
    modal.style.height = (dragStartModalHeight - y) + 'px'
  })

  functions.addEventListeners(modal, ['mouseout', 'mouseup', 'touchend'], (event) => {
    isDragging = false
    modal.style.cursor = 'default'
  })

  setFeatureTitleImage(feature)
  dom.showElements('#feature-title')
  dom.hideElements('#feature-title-input')
  document.querySelector('#feature-title').innerHTML = featureTitle(feature)
  document.querySelector('#feature-details-meta').innerHTML = featureMeta(feature)
  const desc = marked(feature?.properties?.desc || '')
  document.querySelector('#feature-details-body').innerHTML = desc
}

export function setFeatureTitleImage (feature) {
  document.querySelector('#feature-symbol').innerHTML = ''
  if (feature.properties['marker-image-url']) {
    const imageUrl = feature.properties['marker-image-url'].replace('/icon/', '/image/')
    document.querySelector('#feature-symbol').innerHTML =
      "<a href='" + imageUrl + "' target='_blank'>" +
      "<img id='feature-details-icon' src='" + feature.properties['marker-image-url'] + "'></a>"
  } else if (feature.properties['marker-symbol']) {
    document.querySelector('#feature-symbol').innerHTML =
      "<img id='feature-details-icon' src='/emojis/noto/" + feature.properties['marker-symbol'] + ".png'>"
  }
}
