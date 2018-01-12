# bootstrap.affix

Pure AngularJS component replicating [Twitter Bootstrap's Affix](http://twitter.github.io/bootstrap/javascript.html#affix) component behavior.
The affix behavior enables dynamic pinning of a DOM element during page scrolling when specific conditions are met.

## Getting Started

+ Install with bower, `bower install angular-bootstrap-affix --save`

+ Or download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/mgcrea/jquery-bootstrap-affix/master/dist/angular-bootstrap-affix.min.js
[max]: https://raw.github.com/mgcrea/jquery-bootstrap-affix/master/dist/angular-bootstrap-affix.js

In your web page:

```html
<script src="bower_components/angular/angular.js"></script>
<script src="bower_components/angular-jquery/dist/angular-jquery.min.js"></script>
<script src="bower_components/angular-bootstrap-affix/dist/angular-bootstrap-affix.min.js"></script>
<script src="scripts/app.js"></script>
```

In your app.js:

```js
angular.module('myApp', ['mgcrea.bootstrap.affix'])
```

## Documentation

+ To easily add affix behavior to any element, just add `bs-affix` to the element you want to spy on. Then use offsets to define when to toggle the pinning of an element on and off.

+ Check [Twitter Bootstrap's Affix](http://twitter.github.io/bootstrap/javascript.html#affix) docs.

## Examples

```html
<div class="iphone" bs-affix data-offset-top="200" data-offset-bottom="300">
  <div class="iphone-content">
  </div>
</div>
```
