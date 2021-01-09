<div align="center">
  <h1>StreamCompanion (node-sc)</h1>
  <p>Node implementation of StreamCompanion using its built-in WebSocket endpoints.</p>

  <a href="https://github.com/Edqe14/node-sc/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Edqe14/node-sc?style=for-the-badge" alt="License"></img></a>
  <a href="https://david-dm.org/edqe14/node-sc"><img src="https://img.shields.io/librariesio/release/npm/streamcompanion?style=for-the-badge" alt="Dependencies"></img></a>
  <a href="https://github.com/Edqe14/node-sc/issues"><img src="https://img.shields.io/github/issues/Edqe14/node-sc?style=for-the-badge" alt="Open Issues"></img></a>
  <a href="https://npmjs.com/package/streamcompanion"><img src="https://img.shields.io/npm/dt/streamcompanion?style=for-the-badge" alt="Downloads"></img></a>
  <br>
  <a href="https://npmjs.com/package/streamcompanion"><img src="https://nodei.co/npm/streamcompanion.png" alt="Install from NPM"></img></a>
</div>

## Table of contents

- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Documentation](#documentation)
- [License](#license)

## Quick Start

Install from `npm`

```text
npm i --save streamcompanion
```

Usage

```js
const StreamCompanion = require('streamcompanion');
const options = {
  host: 'localhost',
  port: 20727,
  proto: 'http',
  watchTokens: [],
  listeners: {
    tokens: true,
    mapData: true,
    liveData: false
  }
};
const SC = new StreamCompanion(options);
// Use SC
```

## Requirements

 1. Can run [StreamCompanion](https://github.com/Piotrekol/StreamCompanion)
 2. Node **12+**

### Important

If you can't connect to Stream Companion, go to `Settings/Web Overlay` and click `Enable remote access`

## Documentation

[Click Here](https://node-sc.now.sh/) to open the documentation

## License

**This project is using MIT license © Edqe14**  
[Click here](https://github.com/Edqe14/node-sc/blob/main/LICENSE) to read LICENSE.
