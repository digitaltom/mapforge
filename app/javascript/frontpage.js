// loaded in /frontpage/index.html.haml
import AOS from 'aos'

// for debugging
window.AOS = AOS;

['turbo:load'].forEach(function (e) {
  window.addEventListener(e, function () {
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
  aosInit()
  initSwiper()
}

function aosInit () {
  AOS.init({
    duration: 600,
    easing: 'ease-in-out',
    once: true
  })
}

function initSwiper () {
  const config = {
    loop: true,
    speed: 600,
    autoplay: {
      delay: 5000
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
    }
  }
  return new window.Swiper('.swiper', config)
}
