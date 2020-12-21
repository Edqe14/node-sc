const WebSocket = require('ws');
const { get } = require('axios');
const { EventEmitter } = require('events');

module.exports = class SC extends EventEmitter {
  /**
   * StreamCompanion constructor
   * @param {Object} config
   * @param {string} config.host SC Host address
   * @param {Number} config.port SC Port number
   * @param {'http'|'https'} config.proto SC HTTP protocol
   * @param {string[]} config.watchTokens Tokens to watch/get
   * @param {Object} config.listeners
   * @param {boolean} [config.listeners.tokens=true] Toggle token websocket
   * @param {boolean} [config.listeners.mapData=true] Toggle map data websocket
   * @param {boolean} [config.listeners.liveData=false] Toggle live data websocket
   */
  constructor (config) {
    super();
    this.config = Object.assign({
      host: 'localhost',
      port: 20727,
      proto: 'http',
      watchTokens: [],
      listeners: {
        tokens: true,
        mapData: true,
        liveData: false
      }
    }, config);

    this.url = `${this.config.proto}://${this.config.host}:${this.config.port}`;
    this.wsUrl = `${this.config.proto === 'http' ? 'ws' : 'wss'}://${this.config.host}:${this.config.port}`;
    this.ws = {};

    if (this.config.listeners.tokens) {
      this.tokens = {};
      this.watchedTokens = this.config.watchTokens;

      const tokenWs = new WebSocket(`${this.wsUrl}/tokens`);
      tokenWs.type = 'token';
      this._listenHandler(tokenWs);
      this.ws.token = tokenWs;
    }

    if (this.config.listeners.mapData) {
      this.data = {};

      const mapDataWs = new WebSocket(`${this.wsUrl}/mapData`);
      mapDataWs.type = 'mapdata';
      this._listenHandler(mapDataWs);
      this.ws.mapData = mapDataWs;
    }

    if (this.config.listeners.liveData) {
      this.live = {};

      const liveDataWs = new WebSocket(`${this.wsUrl}/liveData`);
      liveDataWs.type = 'livedata';
      this._listenHandler(liveDataWs);
      this.ws.liveData = liveDataWs;
    }
  }

  /**
   * WebSocket listener handler
   * @private
   * @param {WebSocket} ws
   */
  _listenHandler (ws) {
    ws.on('open', () => {
      this.emit('ready', ws.type);
      if (ws.type === 'token') ws.send(JSON.stringify(this.watchedTokens));
    });

    ws.on('message', (data) => {
      data = data.trim();
      if (data.length === 0) return;

      data = JSON.parse(data);
      if (ws.type === 'token') this.tokens = data;
      else if (ws.type === 'mapdata') this.data = data;
      else this.live = data;

      this.emit('data', {
        type: ws.type,
        data
      });
    });

    ws.on('error', (error) => this.emit('error', { ws, error }));
    ws.on('close', () => this.emit('disconnect', ws.type));
  }

  /**
   * Get JSON data of a map
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
   * @param {string=} name Live data key/name
   * @returns string | Object | null
   */
  getLiveData (name) {
    if (!this.config.listeners.liveData) throw new Error('Live data listener is not active!');
    if (!name) return this.live;
    return this.live[name];
  }

  /**
   * Get name value from map data listener cache if exist.
   * Returns all cached map data if no name is given
   * @param {string=} name Map data key/name
   * @returns string | Object | null
   */
  getData (name) {
    if (!this.config.listeners.mapData) throw new Error('Map data listener is not active!');
    if (!name) return this.data;
    return this.data[name];
  }

  /**
   * Get name value from token listener cache if exist.
   * Returns all cached tokens if no name is given
   * @param {string=} name Token key/name
   * @returns string | Object | null
   */
  getToken (token) {
    if (!this.config.listeners.tokens) throw new Error('Tokens listener is not active!');
    if (!token) return this.tokens;
    if (this.watchedTokens.indexOf(token) === -1) this.addToken(token);
    return this.tokens[token];
  }

  /**
   * Add/register token to the listener
   * @param {string} token Token key/name
   */
  addToken (token) {
    if (!this.config.listeners.tokens) throw new Error('Tokens listener is not active!');
    if (!token || typeof token !== 'string') throw new TypeError('Token name is not string!');
    this.watchedTokens.push(token);
    if (this.ws.readyState === 1) this.ws.tokenWs.send(JSON.stringify(this.watchedTokens));
  }

  /**
   * Remove/unregister token from the listener
   * @param {string} token Token key/name
   */
  removeToken (token) {
    if (!this.config.listeners.tokens) throw new Error('Tokens listener is not active!');
    if (!token || typeof token !== 'string') throw new TypeError('Token name is not string!');
    const i = this.watchedTokens.indexOf(token);
    if (i === -1) return;
    this.watchedTokens.splice(i, 1);
    if (this.ws.readyState === 1) this.ws.send(JSON.stringify(this.watchedTokens));
  }

  get osuStatus () {
    return {
      Null: 0,
      Listening: 1,
      Playing: 2,
      Watching: 8,
      Editing: 16,
      ResultsScreen: 32
    };
  }

  get rawOsuStatus () {
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

  get osuGrade () {
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
};
