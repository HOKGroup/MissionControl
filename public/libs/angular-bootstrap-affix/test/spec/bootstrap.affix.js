'use strict';

describe('Module: bootstrap.affix', function () {
  var scope, $sandbox, $compile, $timeout;

  // load the controller's module
  beforeEach(module('mgcrea.bootstrap.affix'));

  beforeEach(inject(function ($injector, $rootScope, _$compile_, _$timeout_) {
    scope = $rootScope;
    $compile = _$compile_;
    $timeout = _$timeout_;

    $sandbox = $('<div id="sandbox"></div>').appendTo($('body'));
  }));

  afterEach(function() {
    $sandbox.remove();
    scope.$destroy();
  });

  var templates = {
    'default': {
      scope: {},
      element: '<div my-directive></div>'
    }
  };

  function compileDirective(template) {
    template = template ? templates[template] : templates['default'];
    angular.extend(scope, template.scope || templates['default'].scope);
    var $element = $(template.element).appendTo($sandbox);
    $element = $compile($element)(scope);
    scope.$digest();
    return $element;
  }

  it('should correctly display hello world', function () {
    var elm = compileDirective();
    expect(elm.text()).toBe('hello world');
  });

});
