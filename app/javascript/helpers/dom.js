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
    const el = document.querySelector(selector)
    if (el) {
      el.classList.remove('hidden')
    } else {
      console.error('Did not find element "' + selector + '" :-(')
    }
  })
}

export function hideElements (selectors) {
  selectors = Array.isArray(selectors) ? selectors : [selectors]
  selectors.forEach(selector => {
    const el = document.querySelector(selector)
    if (el) {
      el.classList.add('hidden')
    } else {
      console.error('Did not find element "' + selector + '" :-(')
    }
  })
}
