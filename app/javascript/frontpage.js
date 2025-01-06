// loaded in /frontpage/index.html.haml

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    if (document.getElementById('frontpage')) {
      init()
    }
  })
});

['turbo:before-visit', 'beforeunload'].forEach(function (e) {
  window.addEventListener(e, function () {
    // console.log(e)
    unload()
  })
})

function unload () {
}

function init () {
}
