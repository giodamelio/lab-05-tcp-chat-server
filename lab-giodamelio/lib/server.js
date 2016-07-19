'use strict';
const net = require('net');

const ClientPool = require('./clientPool');

module.exports = function createServer() {
  const pool = new ClientPool();

  const server = net.createServer((socket) => {
    // Add new client
    pool.emit('connect', socket);

    // Remove client when on disconnect
    socket.on('end', () => {
      pool.emit('disconnect', socket);
    });
  });

  return server;
};
