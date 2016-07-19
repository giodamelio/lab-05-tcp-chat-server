'use strict';
const util = require('util');
const EE = require('events');

const shortid = require('shortid');

function ClientPool() {
  EE.call(this);

  // Keep track of our clients
  this.clients = {};

  // Add new client
  this.on('connect', (client) => {
    const id = shortid.generate();
    client.id = id;
    client.nick = `user_${id}`;
    this.clients[id] = client;
    console.log(`Connection (id: ${id})`);
  });

  // Remove a client
  this.on('disconnect', (client) => {
    delete this.clients[client.id];
    console.log(`Disconnect (id: ${client.id})`);
  });

  // Broadcast a message to all clients
  this.on('broadcast', (sender, message) => {
    for (const id of Object.keys(this.clients)) {
      const client = this.clients[id];
      if (sender.id !== client.id) {
        // TODO: send username in color
        client.write(`${sender.nick}: `);
        client.write(message);
      }
    }
  });
}

util.inherits(ClientPool, EE);

module.exports = ClientPool;
