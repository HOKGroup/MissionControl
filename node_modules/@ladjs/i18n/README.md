# [**@ladjs/i18n**](https://github.com/ladjs/i18n)

[![build status](https://img.shields.io/travis/ladjs/i18n.svg)](https://travis-ci.org/ladjs/i18n)
[![code coverage](https://img.shields.io/codecov/c/github/ladjs/i18n.svg)](https://codecov.io/gh/ladjs/i18n)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/ladjs/i18n.svg)](<>)

> i18n wrapper and Koa middleware for Lad


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [API](#api)
  * [i18n.translate(key, locale)](#i18ntranslatekey-locale)
  * [i18n.middleware(ctx, next)](#i18nmiddlewarectx-next)
  * [i18n.redirect(ctx, next)](#i18nredirectctx-next)
* [Options](#options)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install @ladjs/i18n
```

[yarn][]:

```sh
yarn add @ladjs/i18n
```


## Usage

```js
const I18N = require('@ladjs/i18n');
const phrases = { 'HELLO': 'Hello there!' };
const i18n = new I18N({ phrases });

// ...

app.use(i18n.middleware);
app.use(i18n.redirect);

// ... routes go here ...

app.listen();
```


## API

### i18n.translate(key, locale)

Returns translation for phrase `key` with the given `locale`.

### i18n.middleware(ctx, next)

This middleware uses custom locale detection (in order of priority):

1. Check URL (e.g. if `/de` or `/de/` then it's a `de` locale - as long as `de` is a supported locale)
2. Check the `"locale"` cookie value (or whatever the `cookie` option is defined as)
3. Check `Accept-Language` header

It also exposes the following:

* `ctx.pathWithoutLocale` - the `ctx.path` without the locale in it (this is used by [koa-meta][])
* `ctx.req` - with all of `i18n` API methods (e.g. `ctx.req.t`, `ctx.req.tn`, ...)
* `ctx.locale` - set to the value of `ctx.req.locale` (the current user's locale)
* `ctx.state` - with all of `i18n` API methods (e.g. `ctx.req.t`, `ctx.req.tn`, ...)
* `ctx.state.l` - a shorthand method that accepts a path and returns a localized path (e.g. `ctx.state.l('/contact')` will output `/en/contact` if the locale is "en")
* `ctx.state.availableLanguages` (Array) - which is useful for adding a dropdown to select from an available language
* `ctx.state.currentLanguage` (String) - the current locale's language in native language using [country-language][]'s `getLanguage` method.
* `ctx.translate` (Function) - a helper function for calling `i18n.api.t` to translate a given phrase (same as `i18n.translate` except it throws a `ctx.throw` error using [Boom][])

If the given locale was not available then it will redirect the user to the detected (or default/fallback) locale.

### i18n.redirect(ctx, next)

> Inspired by [node][]'s [language support][language-support].

Redirects user with permanent `302` redirect to their detected locale if a valid language was not found for them.

It also sets the cookie `locale` for future requests to their detected locale.

This also stores the `last_locale` for a user via `ctx.state.user.save()`.


## Options

> We use [i18n][] options per <https://github.com/mashpie/i18n-node#list-of-all-configuration-options>

Default options are as follows and can be overridden:

```js
const i18n = new I18N({
  phrases: {},
  logger: console,
  directory: resolve('locales'),
  locales: ['en', 'es', 'zh'],
  cookie: 'locale',
  indent: '  ',
  defaultLocale: 'en',
  // uses truthy `process.env.I18N_SYNC_FILES`
  syncFiles: false,
  // uses truthy `process.env.I18N_AUTO_RELOAD`
  autoReload: false,
  // uses truthy `process.env.I18N_UPDATE_FILES`
  updateFiles: false,
  api: {
    __: 't',
    __n: 'tn',
    __l: 'tl',
    __h: 'th',
    __mf: 'tmf'
  },
  register: i18n.api
});
```

Note that we automatically bind `logDebugFn`, `logWarnFn`, and `logErrorFn` for [i18n][] options to `logger.debug`, `logger.warn`, and `logger.error` respectively.

For a list of all available locales see [i18n-locales][].


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com/)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[i18n]: https://github.com/mashpie/i18n-node

[i18n-locales]: https://github.com/ladjs/i18n-locales

[koa-meta]: https://github.com/ladjs/koa-meta

[country-language]: https://github.com/bdswiss/country-language

[boom]: https://github.com/hapijs/boom

[node]: https://nodejs.org

[language-support]: https://github.com/nodejs/nodejs.org/commit/d6cdd942a8fc0fffcf6879eca124295e95991bbc#diff-78c12f5adc1848d13b1c6f07055d996eR59
