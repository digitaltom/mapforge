import * as functions from 'helpers/functions'

export function waitForElement (selector, callback, waitTime = 100) {
  const el = document.querySelector(selector)
  if (el) {
    callback(el)
  } else {
    setTimeout(() => waitForElement(selector, callback, waitTime), waitTime)
  }
}

export function showElements (selectors) {
  selectors = Array.isArray(selectors) ? selectors : [selectors]
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.classList.remove('hidden')
    })
  })
}

export function hideElements (selectors) {
  selectors = Array.isArray(selectors) ? selectors : [selectors]
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.classList.add('hidden')
    })
  })
}

export function animateElement (selector, effect = 'fade-in', delay = 0) {
  functions.e(selector, e => {
    e.classList.remove('aos-animate')
    e.setAttribute('data-aos', effect)
    e.setAttribute('data-aos-delay', delay)
    e.classList.remove('hidden')
    window.AOS.refreshHard()
  })
}
