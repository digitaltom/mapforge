export function waitForElement (selector, callback, waitTime = 100) {
  const el = document.querySelector(selector)
  if (el) {
    callback(el)
  } else {
    setTimeout(() => waitForElement(selector, callback, waitTime), waitTime)
  }
}
