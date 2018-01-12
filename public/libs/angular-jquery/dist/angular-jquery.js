/**
 * angular-jquery
 * @version v0.2.1 - 2013-07-24
 * @link https://github.com/mgcrea/angular-jquery
 * @author Olivier Louvignes <olivier@mg-crea.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
angular.module('mgcrea.jquery', []).provider('dimensions', function () {
  this.$get = function () {
    return this;
  };
  this.offset = function () {
    if (!this)
      return;
    var box = this.getBoundingClientRect();
    var docElem = this.ownerDocument.documentElement;
    return {
      top: box.top + window.pageYOffset - docElem.clientTop,
      left: box.left + window.pageXOffset - docElem.clientLeft
    };
  };
  this.height = function (outer) {
    var computedStyle = window.getComputedStyle(this);
    var value = this.offsetHeight;
    if (outer) {
      value += parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom);
    } else {
      value -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom) + parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth);
    }
    return value;
  };
  this.width = function (outer) {
    var computedStyle = window.getComputedStyle(this);
    var value = this.offsetWidth;
    if (outer) {
      value += parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight);
    } else {
      value -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight) + parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.borderRightWidth);
    }
    return value;
  };
}).constant('debounce', function (fn, wait) {
  var timeout, result;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      result = fn.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    return result;
  };
}).provider('jQuery', [
  'dimensionsProvider',
  function (dimensionsProvider) {
    var self = this;
    var jQLite = angular.element;
    this.fn = angular.extend({}, dimensionsProvider);
    this.$get = function () {
      delete self.fn.$get;
      return function jQuery(query) {
        var el = query instanceof HTMLElement ? query : document.querySelectorAll(query);
        el = jQLite(el);
        angular.forEach(self.fn, function (fn, key) {
          el[key] = fn.bind(el[0]);
        });
        return el;
      };
    };
  }
]);