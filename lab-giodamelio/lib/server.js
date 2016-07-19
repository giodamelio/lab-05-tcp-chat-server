'use strict';
const net = require('net');

module.exports = function createServer() {
  const server = net.createServer((socket) => {
    socket.write('Hello World');
    socket.end();
  });

  return server;
};
