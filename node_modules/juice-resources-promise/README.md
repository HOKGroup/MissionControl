# juice-resources-promise

[![build status](https://img.shields.io/travis/niftylettuce/juice-resources-promise.svg)](https://travis-ci.org/niftylettuce/juice-resources-promise)
[![code coverage](https://img.shields.io/codecov/c/github/niftylettuce/juice-resources-promise.svg)](https://codecov.io/gh/niftylettuce/juice-resources-promise)
[![code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![made with lass](https://img.shields.io/badge/made_with-lass-95CC28.svg)](https://lass.js.org)
[![license](https://img.shields.io/github/license/niftylettuce/juice-resources-promise.svg)](<>)

> Simple helper function to convert `juice.juiceResources` into a Promise


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Contributors](#contributors)
* [License](#license)


## Install

[npm][]:

```sh
npm install juice-resources-promise
```

[yarn][]:

```sh
yarn add juice-resources-promise
```


## Usage

```js
const juiceResources = require('juice-resources-promise');

juiceResources(html, options).then(console.log).catch(console.error);
```


## Contributors

| Name           | Website                    |
| -------------- | -------------------------- |
| **Nick Baugh** | <http://niftylettuce.com/> |


## License

[MIT](LICENSE) © [Nick Baugh](http://niftylettuce.com/)


## 

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/
