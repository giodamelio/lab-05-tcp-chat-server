'use strict';
const util = require('util');
const EE = require('events');

const chalk = require('chalk');

const shortid = require('shortid');

const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

function ClientPool() {
  EE.call(this);

  // Keep track of our clients
  this.clients = {};

  // Add new client
  this.on('connect', (client) => {
    const id = shortid.generate();
    client.id = id;
    client.nick = `user_${id}`;

    // Pick out a color for the user
    client.color = colors[Math.floor(colors.length * Math.random())];

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
        const username = chalk[sender.color].underline(sender.nick);
        client.write(`${username}: `);
        client.write(message);
      }
    }
  });
}

util.inherits(ClientPool, EE);

module.exports = ClientPool;
