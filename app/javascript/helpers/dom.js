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
