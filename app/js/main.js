var swiper = new Swiper(".promo-slider", {
  slidesPerView: 3,
  spaceBetween: 30,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
    breakpoints: {
    0: {
      slidesPerView: 2,
    },
    880: {
      slidesPerView: 3,
    }
  },
});