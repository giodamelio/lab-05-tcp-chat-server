'use strict';
const net = require('net');
const Buffer = require('buffer').Buffer;

const ClientPool = require('./clientPool');

module.exports = function createServer() {
  const pool = new ClientPool();

  const server = net.createServer((socket) => {
    // Add new client
    pool.ee.emit('connect', socket);

    // Broadcast messages to clients
    // TODO: Handle long messages
    socket.on('data', (data) => {
      // Quit on a control-c
      if (data.compare(new Buffer([0xff, 0xf4, 0xff, 0xfd, 0x06])) === 0) {
        return socket.end();
      } else if (data.toString()[0] === '/') {
        return pool.ee.emit('command', socket, data);
      }

      return pool.ee.emit('broadcast', socket, data);
    });

    // Remove client when on disconnect
    socket.on('end', () => {
      pool.ee.emit('disconnect', socket);
    });
  });

  // Listen for server commands from stdin
  process.stdin.on('data', (rawCommand) => {
    rawCommand = rawCommand.toString().slice(1).trim().split(' ');
    const command = rawCommand[0];
    const args = rawCommand.splice(1);

    if (command === 'list') {
      for (const id of Object.keys(pool.clients)) {
        const client = pool.clients[id];
        process.stdout.write(`${client.nick} (${client.id})\n`);
      }
      return;
    } else if (command === 'kick') {
      if (args.length !== 1) {
        process.stdout.write('Usage /kick <id>\n');
        return;
      }

      for (const id of Object.keys(pool.clients)) {
        if (id !== args[0]) {
          continue;
        }
        const client = pool.clients[id];
        process.stdout.write(`Kicking user ${client.nick}(${client.id})\n`);
        client.write('You have been kicked\n');
        client.end();
      }
      return;
    }
  });

  return server;
};
