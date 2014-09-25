/*global $, alert, console*/

$(function () {
  'use strict';
  var $window, $navBar, $skillsWrapper, windowTop, navTop, skillsTop, $topLink;

  // sticky nav on scroll
  $window = $(window);
  $navBar = $('nav');
  $skillsWrapper = $('#skillsWrapper');
  $topLink = $('.topLink');

  $window.scroll(function () {
    windowTop = $window.scrollTop();
    navTop = $navBar.offset().top;
    skillsTop = $skillsWrapper.offset().top;

    if (windowTop >= navTop) {
      $navBar.addClass('stickyNav');
      if ($window.width() >= 700) {
        $topLink.css({'display': 'inline-block'});
      }
    }

    if ((skillsTop - $navBar.height()) >= windowTop) {
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
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});
