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
    this.clients[shortid] = client;
    console.log(`Connection (id: ${id})`);
  });

  // Remove a client
  this.on('disconnect', (client) => {
    delete this.clients[client.id];
    console.log(`Disconnect (id: ${client.id})`);
  });
}

util.inherits(ClientPool, EE);

module.exports = ClientPool;
