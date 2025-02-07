import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  swiper = null

  connect () {
    this.swiper = this.initSwiper()
  }

  initSwiper () {
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
        slideChange: () => {
          this.slideChange()
        }
      }
    }
    return new window.Swiper('.swiper', config)
  }

  slideChange () {
    if (this.swiper && document.getElementById('swiper-image')) {
      // console.log('Slide changed to:', swiper.realIndex)
      document.getElementById('swiper-image').src = 'images/frontpage/feature' + this.swiper.realIndex + '.png'
    }
  }
}
