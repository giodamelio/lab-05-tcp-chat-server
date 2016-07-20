'use strict';
const net = require('net');

const expect = require('chai').expect;

const createServer = require('../lib/server');

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; // eslint-disable-line
}

const quietStream = {
  write() {},
};

describe('Server', () => {
  beforeEach(function (done) {
    this.port = randomBetween(3892, 3928);
    this.server = createServer(quietStream);
    this.server.listen(this.port, done);
  });

  afterEach(function (done) {
    this.server.close(done);
  });

  it('Creates server', function () {
    expect(this.server).to.exist;
  });

  it('Receives welcome message', function (done) {
    const connection = net.connect(this.port);
    connection.on('data', (data) => {
      data = data.toString().trim().split('\n');

      // Make sure the welcome message is valid
      expect(data[0]).to.equal(
        'Welcome to the \u001b[4m\u001b[1m\u001b[37mBEST\u001b[39m\u001b[22m\u001b[24m chat server ever!' // eslint-disable-line
      );
      expect(data[1]).to.equal(
        'Run /nick <new_nickname> to set your name'
      );
      expect(data[2]).to.equal(
        'For a list of available commands run /help'
      );
      expect(data[3]).to.have.string(
        '\u001b[37m\u001b[4m\u001b[1mSERVER\u001b[22m\u001b[24m\u001b[39m: user_'
      );
      connection.destroy();
      done();
    });
  });

  it('Two users can chat', function (done) {
    const client1 = net.connect(this.port);
    const client2 = net.connect(this.port);
    const messages = [
      'Welcome to the \u001b[4m\u001b[1m\u001b[37mBEST\u001b[39m\u001b[22m\u001b[24m chat server ever!\nRun /nick <new_nickname> to set your name\nFor a list of available commands run /help\n\u001b[37m\u001b[4m\u001b[1mSERVER\u001b[22m\u001b[24m\u001b[39m:', //eslint-disable-line
      'test message',
      '\u001b[37m\u001b[4m\u001b[1mSERVER\u001b[22m\u001b[24m\u001b[39m:',
    ];
    const toSend = ['test message'];

    client2.on('data', (data) => {
      expect(data.toString()).to.have.string(messages.shift());
      if (toSend.length) {
        client1.write(toSend.pop());
      } else {
        client1.end();
      }
    });

    client1.on('close', () => {
      client2.end();
      expect(messages.length).to.eql(0);
      done();
    });
  });

  describe('Commands', () => {
    it('Change nickname', function (done) {
      const connection = net.connect(this.port, () => {
        connection.write('/nick giodamelio\n');
        connection.on('data', (data) => {
          data = data.toString().trim().split('\n');
          if (data.length === 4) return;
          expect(data[data.length - 1])
            .to.have.string('changed their nickname');
          connection.destroy();
          done();
        });
      });
    });

    it('Change color', function (done) {
      const connection = net.connect(this.port, () => {
        connection.write('/color red\n');
        connection.on('data', (data) => {
          data = data.toString().trim().split('\n');
          if (data.length === 4) return;
          expect(data[data.length - 1])
            .to.equal('Color changed to \u001b[31mred\u001b[39m');
          connection.destroy();
          done();
        });
      });
    });

    it('List users', function (done) {
      const connection = net.connect(this.port, () => {
        connection.write('/list\n');
        connection.on('data', (data) => {
          data = data.toString().trim().split('\n');
          if (data.length === 4) return;
          expect(data[data.length - 1])
            .to.have.string('user_');
          connection.destroy();
          done();
        });
      });
    });
  });
});
