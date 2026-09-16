(function () {
  'use strict';

  function isProtected(element) {
    return Boolean(element.closest('header, #mobileMenu, nav, aside, footer, .site-footer')) ||
      element.id === 'burger' ||
      element.id === 'mobile-menu-btn' ||
      element.id === 'close-sidebar' ||
      element.classList.contains('nav-item') ||
      element.hasAttribute('data-preserve-action') ||
      element.getAttribute('onclick')?.includes('handleLogout');
  }

  document.querySelectorAll('button, a.btn-primary, a.btn-ghost, a.btn-home, a.btn-back').forEach(function (target) {
    if (isProtected(target)) return;

    if (target.tagName === 'A') {
      target.setAttribute('href', '404.html');
    } else {
      target.setAttribute('onclick', "window.location.href='404.html'; return false;");
    }
  });
})();
