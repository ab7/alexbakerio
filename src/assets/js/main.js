/*global $, alert, console*/

$(function () {
  'use strict';
  var $window, $navBar, $stick, windowTop, navTop, introTop, $topLink;

  // sticky nav on scroll
  $window = $(window);
  $navBar = $('nav');
  $stick = $('.stick');
  $topLink = $('.nav-top-link');

  $window.scroll(function () {
    windowTop = $window.scrollTop();
    navTop = $navBar.offset().top;
    introTop = $stick.offset().top;

    if (windowTop >= navTop) {
      $navBar.addClass('nav-sticky');
      if ($window.width() >= 440) {
        $topLink.fadeIn();
      }
    }

    if ((introTop - $navBar.height()) >= windowTop) {
      $navBar.removeClass('nav-sticky');
      $topLink.hide();
    }
  });

  // smooth scroll to anchor
  $('a[href*=#]:not([href=#])').click(function () {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top - 76
        }, 1000);
        return false;
      }
    }
  });
});
