'use strict';
const net = require('net');

const ClientPool = require('./clientPool');

module.exports = function createServer() {
  const pool = new ClientPool();

  const server = net.createServer((socket) => {
    // Add new client
    pool.emit('connect', socket);

    // Broadcast messages to clients
    // TODO: Handle long messages
    socket.on('data', (data) => {
      if (data.toString()[0] === '/') {
        return pool.emit('command', socket, data);
      }

      return pool.emit('broadcast', socket, data);
    });

    // Remove client when on disconnect
    socket.on('end', () => {
      pool.emit('disconnect', socket);
    });
  });

  return server;
};
