const WebSocket = require('ws');
const { get } = require('axios');
const { EventEmitter } = require('events');

class SC extends EventEmitter {
  /**
   * StreamCompanion constructor
   * @param {Object} config
   * @param {string} config.host SC Host address
   * @param {Number} config.port SC Port number
   * @param {'http'|'https'} config.proto SC HTTP protocol. This will also change the websocket protocol to `wss` if `https` is used here
   * @param {string[]} config.watchTokens Default tokens to watch/get
   * @param {boolean} [config.initializeAutomatically=true] Automatically create and connect to WebSockets
   * @param {Object} config.listeners
   * @param {boolean} [config.listeners.tokens=true] Toggle token websocket
   * @param {boolean} [config.listeners.mapData=true] Toggle map data websocket
   * @param {boolean} [config.listeners.liveData=false] Toggle live data websocket
   * @param {Object} config.ws
   * @param {Number} config.ws.reconnectInterval Reconnect interval
   * @param {Number} config.ws.maxTries Max tries to reconnect before emitting an error
   */
  constructor (config) {
    super();
    this.config = Object.assign({
      host: 'localhost',
      port: 20727,
      proto: 'http',
      watchTokens: [],
      initializeAutomatically: true,
      listeners: {
        tokens: true,
        mapData: true,
        liveData: false
      },
      ws: {
        reconnectInterval: 3000,
        maxTries: 5
      }
    }, config);

    this.url = `${this.config.proto}://${this.config.host}:${this.config.port}`;
    this.wsUrl = `${this.config.proto === 'http' ? 'ws' : 'wss'}://${this.config.host}:${this.config.port}`;
    this.ws = {};
    this.initialized = false;
    if (this.config.initializeAutomatically) this.initialize();
  }

  /**
   * Initialize/Start creating WebSocket clients
   * You need to run this if `config.initializeAutomatically` is false
   * @method
   */
  initialize () {
    this.initialized = true;
    if (this.config.listeners.tokens) {
      this.tokens = {};
      this.watchedTokens = this.config.watchTokens;
      if (this.ws.token instanceof WebSocket) this.ws.token.removeAllListeners();
      this.ws.token = this._createWS(`${this.wsUrl}/tokens`, 'token');
    }

    if (this.config.listeners.mapData) {
      this.data = {};
      if (this.ws.mapData instanceof WebSocket) this.ws.mapData.removeAllListeners();
      this.ws.mapData = this._createWS(`${this.wsUrl}/mapData`, 'mapData');
    }

    if (this.config.listeners.liveData) {
      this.live = {};
      if (this.ws.liveData instanceof WebSocket) this.ws.liveData.removeAllListeners();
      this.ws.liveData = this._createWS(`${this.wsUrl}/liveData`, 'liveData');
    }
  }

  /**
   * Create new WebSocket client
   * @private
   * @param {string} url WebSocket URI
   * @param {string} type WebSocket Type
   * @param {number=} reconnectTries Reconnect tries count
   */
  _createWS (url, type, reconnectTries = 0) {
    const ws = new WebSocket(url);
    ws.type = type;
    ws.reconnectTries = reconnectTries;
    this._listenHandler(ws);
    return ws;
  }

  /**
   * WebSocket listener handler
   * @private
   * @param {WebSocket} ws
   */
  _listenHandler (ws) {
    ws.on('open', () => {
      /**
       * Emitted when a websocket is open
       * @event SC#ready
       *
       * @type {string}
       */
      this.emit('ready', ws.type);
      if (ws.reconnectTries > 0) ws.reconnectTries = 0;
      if (ws.type === 'token') ws.send(JSON.stringify(this.watchedTokens));
    });

    ws.on('message', (data) => {
      data = data.trim();
      if (data.length === 0) return;

      data = JSON.parse(data);
      if (ws.type === 'token') this.tokens = data;
      else if (ws.type === 'mapData') this.data = data;
      else this.live = data;

      /**
       * Emitted when data is received from any of the enabled websockets
       * @event SC#data
       *
       * @type {object}
       * @property {string} type WebSocket type
       * @property {any} data Received data
       */
      this.emit('data', {
        type: ws.type,
        data
      });
    });

    ws.on('error', (error) => {
      /**
       * Emitted when an expected or unexpected error has occured
       * @event SC#error
       *
       * @type {object}
       * @property {WebSocket | string | null} ws WebSocket
       * @property {Error | TypeError} error Error
       */
      if ((ws.reconnectTries === 0 && !error.message.includes('connect')) || ws.reconnectTries >= this.config.ws.maxTries) this.emit('error', { ws, error });
    });
    ws.on('close', () => {
      /**
       * Emitted when a websocket is disconnected from StreamCompanion
       * @event SC#disconnect
       *
       * @type {string}
       */
      this.emit('disconnect', ws.type);
      if (ws.reconnectTries >= this.config.ws.maxTries) {
        return this.emit('error', {
          ws,
          error: new Error(`Failed to reconnect WebSocket after retrying ${this.config.ws.maxTries} times.`)
        });
      }

      setTimeout(() => {
        /**
         * @event SC#reconnecting
         * @type {string}
         */
        this.emit('reconnecting', ws.type);
        ws.removeAllListeners();
        this.ws[ws.type] = this._createWS(ws.url, ws.type, ws.reconnectTries + 1);
      }, this.config.ws.reconnectInterval);
    });
  }

  /**
   * Get JSON data of a map
   * @method
   * @returns {Promise<object>}
   */
  getJson () {
    return new Promise((resolve, reject) => {
      get(`${this.url}/json`)
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    });
  }

  /**
   * Get map background image data
   * @method
   * @returns {Promise<object>}
   */
  getBackground () {
    return new Promise((resolve, reject) => {
      get(`${this.url}/backgroundImage`)
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    });
  }

  /**
   * Get web overlay list
   * @method
   * @returns {Promise<object>}
   */
  getOverlayList () {
    return new Promise((resolve, reject) => {
      get(`${this.url}/overlayList`)
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    });
  }

  /**
   * Get SC settings
   * @method
   * @returns {Promise<object>}
   */
  getSettings () {
    return new Promise((resolve, reject) => {
      get(`${this.url}/settings`)
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    });
  }

  /**
   * Get name value from live listener cache if exist.
   * Returns all cached live data if no name is given
   * @method
   * @param {string=} name Live data key/name
   * @returns {?string|object} Live data value `string`, entire live data cache `object` or `null` if the live data name doesn't exist
   */
  getLiveData (name) {
    if (!this.initialized) {
      this.emit('error', {
        ws: null,
        error: new Error('Not initialized')
      });
      return;
    }
    if (!this.config.listeners.liveData) {
      this.emit('error', {
        ws: 'liveData',
        error: new Error('Live data listener is not active!')
      });
      return;
    }
    if (!name) return this.live;
    return this.live[name];
  }

  /**
   * Get name value from map data listener cache if exist.
   * Returns all cached map data if no name is given
   * @method
   * @param {string=} name Map data key/name
   * @returns {?string|object} Data value `string`, entire data cache `object` or `null` if the data name doesn't exist
   */
  getData (name) {
    if (!this.initialized) {
      this.emit('error', {
        ws: null,
        error: new Error('Not initialized')
      });
      return;
    }
    if (!this.config.listeners.mapData) {
      this.emit('error', {
        ws: 'mapData',
        error: new Error('Map data listener is not active!')
      });
      return;
    }
    if (!name) return this.data;
    return this.data[name];
  }

  /**
   * Get name value from token listener cache if exist.
   * Returns all cached tokens if no name is given
   * @method
   * @param {string=} token Token key/name
   * @returns {?string|object} Token value `string`, entire token cache `object` or `null` if the token doesn't exist
   */
  getToken (token) {
    if (!this.initialized) {
      this.emit('error', {
        ws: null,
        error: new Error('Not initialized')
      });
      return;
    }
    if (!this.config.listeners.tokens) {
      this.emit('error', {
        ws: 'token',
        error: new Error('Tokens listener is not active!')
      });
      return;
    }
    if (!token) return this.tokens;
    if (this.watchedTokens.indexOf(token) === -1) this.addToken(token);
    return this.tokens[token];
  }

  /**
   * Add/register token to the listener
   * @method
   * @param {string} token Token key/name
   * @returns {Boolean}
   */
  addToken (token) {
    if (!this.initialized) {
      this.emit('error', {
        ws: null,
        error: new Error('Not initialized')
      });
      return false;
    }

    if (!this.config.listeners.tokens) {
      this.emit('error', {
        ws: 'token',
        error: new Error('Tokens listener is not active!')
      });
      return false;
    }

    if (!token || typeof token !== 'string') {
      this.emit('error', {
        ws: 'token',
        error: new TypeError('Token name is not string!')
      });
      return false;
    }

    if (this.watchedTokens.includes(token)) return false;
    this.watchedTokens.push(token);
    if (this.ws.token.readyState === 1) {
      this.ws.token.send(JSON.stringify(this.watchedTokens));
      return true;
    }
    return false;
  }

  /**
   * Remove/unregister token from the listener
   * @method
   * @param {string} token Token key/name
   * @returns {Boolean}
   */
  removeToken (token) {
    if (!this.initialized) {
      this.emit('error', {
        ws: null,
        error: new Error('Not initialized')
      });
      return false;
    }

    if (!this.config.listeners.tokens) {
      this.emit('error', {
        ws: 'token',
        error: new Error('Tokens listener is not active!')
      });
      return false;
    }

    if (!token || typeof token !== 'string') {
      this.emit('error', {
        ws: 'token',
        error: new TypeError('Token name is not string!')
      });
      return false;
    }
    const i = this.watchedTokens.indexOf(token);
    if (i === -1) return false;
    this.watchedTokens.splice(i, 1);
    if (this.ws.token.readyState === 1) {
      this.ws.token.send(JSON.stringify(this.watchedTokens));
      return true;
    }
    return false;
  }

  /**
   * @static
   */
  static get osuStatus () {
    return {
      Null: 0,
      Listening: 1,
      Playing: 2,
      Watching: 8,
      Editing: 16,
      ResultsScreen: 32
    };
  }

  /**
   * @static
   */
  static get rawOsuStatus () {
    return {
      Unknown: -2,
      NotRunning: -1,
      MainMenu: 0,
      EditingMap: 1,
      Playing: 2,
      GameShutdownAnimation: 3,
      SongSelectEdit: 4,
      SongSelect: 5,
      ResultsScreen: 7,
      GameStartupAnimation: 10,
      MultiplayerRooms: 11,
      MultiplayerRoom: 12,
      MultiplayerSongSelect: 13,
      MultiplayerResultsscreen: 14,
      OsuDirect: 15,
      RankingTagCoop: 17,
      RankingTeam: 18,
      ProcessingBeatmaps: 19,
      Tourney: 22
    };
  }

  /**
   * @static
   */
  static get osuGrade () {
    return {
      0: 'SSH',
      1: 'SH',
      2: 'SS',
      3: 'S',
      4: 'A',
      5: 'B',
      6: 'C',
      7: 'D',
      8: 'F',
      9: ''
    };
  }
}

module.exports = SC;
