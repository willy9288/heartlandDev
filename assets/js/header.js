// assets/js/header.js
(function () {
  'use strict';

  function syncHeaderOffset() {
    const header = document.querySelector('.navbar.fixed-top');
    const h = header ? header.offsetHeight : 0;
    document.documentElement.style.setProperty('--header-h', `${h}px`);
  }

  document.addEventListener('DOMContentLoaded', syncHeaderOffset);
  window.addEventListener('resize', syncHeaderOffset);
})();
