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
      $topLink.css({'display': 'none'});
    }
  });
});
