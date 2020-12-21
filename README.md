# StreamCompanion

Node implementation of StreamCompanion using its built-in WebSocket endpoints.

[![License](https://img.shields.io/github/license/Edqe14/node-sc?style=for-the-badge)](https://github.com/Edqe14/node-sc/blob/main/LICENSE)
![Dependencies](https://img.shields.io/librariesio/release/npm/streamcompanion?style=for-the-badge)
[![Open Issues](https://img.shields.io/github/issues/Edqe14/node-sc?style=for-the-badge)](https://github.com/Edqe14/node-sc/issues)

## Requirements

 1. Can run [StreamCompanion](https://github.com/Piotrekol/StreamCompanion)
 2. Node **12+**

## Documentation

```js
/* Import/Require the package */
import StreamCompanion from 'streamcompanion';
// CommonJS
const StreamCompanion = require('streamcompanion');

const options = {       // Default configuration
  host: 'localhost',    // SC host
  port: 20727,          // SC port
  proto: 'http',        // SC protocol
  watchTokens: [],      // Tokens to watch (optional if listeners.tokens is false)
  listeners: {
    tokens: true,       // Tokens listener/websocket
    mapData: true,      // Map Data listener/websocket
    liveData: false     // Live Data listener/websocket
  }
};

const SC = new StreamCompanion(options);

/* SC Events
 * ---------
 * ready (ws.type) Emitted on websocket is connected
 * data (ws, data) Emitted on websocket data is received
 * error (ws, error) Emitted on websocket error
 * disconnect (ws.type) Emitted on websocket disconnect
 */

/* WebSocket/Listener types
 * ------------------------
 * tokens, mapdata, livedata
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
