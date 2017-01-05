/*global $, alert, console*/

$(function () {
  'use strict';

  // Mobile menu
  var options = {
    label: '',
    brand: '<a href="/"><img class="mobile-logo" src="assets/images/alex-baker-logo.png" alt="Alex Baker\'s logo"></a>'
  };
  $('#main-nav').slicknav(options);
});
