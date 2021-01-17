/* eslint-disable */
const StreamCompanion = require('../src/sc.js');
const SC = new StreamCompanion({
  watchTokens: [
    'score'
  ],
  listeners: {
    tokens: true,
    liveData: true,
    mapData: true
  }
});

test('is streamcompanion running', (done) => {
  require('ps-node').lookup({
    command: 'StreamCompanion'
  }, (err, res) => {
    if (err) throw err;
    expect(res.some(r => r.command.includes('StreamCompanion'))).toBe(true);
    done();
  });
});

test('is osu! running', (done) => {
  require('ps-node').lookup({
    command: 'osu!'
  }, (err, res) => {
    if (err) throw err;
    expect(res.some(r => r.command.includes('osu!'))).toBe(true);
    done();
  });
});

test('get background', async () => {
  expect(typeof (await SC.getBackground())).toBe('string');
});

test('get json', async () => {
  expect(typeof (await SC.getJson())).toBe('object');
});

test('get overlay list', async () => {
  expect(typeof (await SC.getOverlayList())).toBe('object');
});

test('get settings', async () => {
  expect(typeof (await SC.getSettings())).toBe('object');
});

describe('token', () => {
  test('get', () => {
    expect(typeof SC.getToken()).toBe('object');
    expect(typeof SC.getToken('score')).toBe('number');
    expect(typeof SC.getToken('doesnt_exist')).toBe('undefined');
  });

  test('add', () => {
    expect(SC.addToken('time')).toBe(true);
    expect(SC.addToken('score')).toBe(false);
  });

  test('remove', () => {
    expect(SC.removeToken('time')).toBe(true);
    expect(SC.removeToken('time')).toBe(false);
  });
});

test('get map data', () => {
  expect(typeof SC.getData()).toBe('object');
  expect(typeof SC.getData('np_all')).toBe('string');
  expect(typeof SC.getData('doesnt_exist')).toBe('undefined');
});

test('get live data', () => {
  expect(typeof SC.getLiveData()).toBe('object');
  expect(typeof SC.getLiveData('livepp_hits')).toBe('string');
  expect(typeof SC.getLiveData('doesnt_exist')).toBe('undefined');
});
