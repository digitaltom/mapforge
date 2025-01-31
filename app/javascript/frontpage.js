// loaded in /frontpage/index.html.haml

let swiper;

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
  swiper = initSwiper()
}

function initSwiper () {
  const config = {
    loop: true,
    speed: 1200,
    autoplay: {
      delay: 8000
    },
    slidesPerView: 'auto',
    centeredSlides: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    on: {
      slideChange
    }
  }
  return new window.Swiper('.swiper', config)
}

function slideChange () {
  if (swiper) {
    // console.log('Slide changed to:', swiper.realIndex)
    document.getElementById('swiper-image').src = 'images/frontpage/feature' + swiper.realIndex + '.png'
  }
}
