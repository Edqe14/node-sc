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

```js
/* Import/Require the package */
// ES6
import StreamCompanion from 'streamcompanion';
// CommonJS
const StreamCompanion = require('streamcompanion');

const options = {                 // Default configuration
  host: 'localhost',              // SC host
  port: 20727,                    // SC port
  proto: 'http',                  // SC protocol
  watchTokens: [],                // Tokens to watch (optional if listeners.tokens is false)
  initializeAutomatically: true,  // Automatically create and connect to WebSockets
  listeners: {
    tokens: true,                 // Tokens listener/websocket
    mapData: true,                // Map Data listener/websocket
    liveData: false               // Live Data listener/websocket
  },
  ws: {
    reconnectInterval: 3000,      // Reconnect interval
    maxTries: 5                   // Max tries to reconnect before throwing an error (Set to Infinity for no max tries)
  }
};

const SC = new StreamCompanion(options);
// Initialize WebSocket (only if initializeAutomatically is false)
// HTTP Methods (getBackground, getJson, etc.) is not affected by this/initialization
SC.initialize();

/* SC Events
 * ---------
 * ready (ws.type) Emitted on websocket is connected
 * data (ws, data) Emitted on websocket data is received
 * error (ws, error) Emitted on websocket/method error
 * disconnect (ws.type) Emitted on websocket disconnect
 * reconnecting (ws.type) Emitted on websocket trying to reconnect
 */

/* WebSocket/Listener types
 * ------------------------
 * tokens, mapData, liveData
 */

SC.on('data', ({
  ws,   // WebSocket
  data  // Data received
}) => {
  if (ws.type === 'tokens') {
    // Do something
  } else if (ws.type === 'mapdata') {
    // Do something
  } else {
    // Do something
  }
});
  


// METHODS
// [] = Optional

SC.getToken([tokenName]); >> string | Object | null
// Returns the value from token listener cache if exists.
// If tokenName is null, it will return all cached tokens

SC.addToken(tokenName); >> void
// Add/register token name to the listener

SC.removeToken(tokenName); >> void
// Remove/unregister token name from the listener

SC.getData(dataName); >> string | Object | null;
// Returns the  value from data listener cache if exists.
// If dataName is null, it will return all cached data

SC.getLiveData(dataName); >> string | Object | null;
// Returns the value from live data listener cache if exists.
// If dataName is null, it will return all cached data

// Get JSON data from /json
SC.getJson(); >> Promise<Object>

// Get background image from /backgroundImage
SC.getBackground(); >> Promise<any>

// Get web overlay list from /overlayList
SC.getOverlayList(); >> Promise<string[]>

// Get SC settings from /settings
SC.getSettings(); >> Promise<Object>



// GETTERS                                                   
SC.osuStatus >> Object;
SC.rawOsuStatus >> Object;
SC.osuGrade >> Object;
```

Shoutout to [Piotrekol](https://github.com/Piotrekol) for making [StreamCompanion](https://github.com/Piotrekol/StreamCompanion)!

## License

**This project is using MIT license © Edqe14**  
[Click here](https://github.com/Edqe14/node-sc/blob/main/LICENSE) to read LICENSE.
