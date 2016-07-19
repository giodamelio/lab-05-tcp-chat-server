const expect = require('chai').expect;

const createServer = require('../lib/server');

describe('Server', () => {
  it('Creates server', () => {
    const server = createServer();
    expect(server).to.exist;
  });
});
