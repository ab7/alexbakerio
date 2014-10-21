/*global $, alert, console*/

$(function () {
  'use strict';
  var $window, $navBar, $introduction, windowTop, navTop, introTop, $topLink, $linkSpan;

  // sticky nav on scroll
  $window = $(window);
  $navBar = $('nav');
  $introduction = $('.introduction');
  $topLink = $('.topLink');
  $linkSpan = $topLink.children('span');

  $window.scroll(function () {
    windowTop = $window.scrollTop();
    navTop = $navBar.offset().top;
    introTop = $introduction.offset().top;

    if (windowTop >= navTop) {
      $navBar.addClass('stickyNav');
      if ($window.width() >= 440) {
        $topLink.fadeIn();
        $linkSpan.fadeIn();
      }
    }

    if ((introTop - $navBar.height()) >= windowTop) {
      $navBar.removeClass('stickyNav');
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
