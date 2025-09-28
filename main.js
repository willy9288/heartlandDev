import './assets/scss/all.scss';
import 'bootstrap/dist/js/bootstrap.min.js';

import './assets/js/header'

console.log('Hello world');

import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/navigation';

const photoSwiper = new Swiper('.photo-swiper', {
  modules: [Navigation],
  slidesPerView: 2.5, // 顯示 2.5 張
  spaceBetween: 30,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: true,
  breakpoints: {
    0: { slidesPerView: 1.2 },
    768: { slidesPerView: 2 },
    1200: { slidesPerView: 2.5 },
  },
});

const workshopSwiper = new Swiper('.workshop-swiper', {
  modules: [Navigation],
  slidesPerView: 1, // 每次一張
  spaceBetween: 0,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  loop: true,
});