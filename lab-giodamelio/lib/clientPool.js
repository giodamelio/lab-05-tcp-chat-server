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
      if (sender === 'server') {
        const serverName = chalk.white.underline.bold('SERVER');
        client.write(`${serverName}: `);
        client.write(message);
      } else if (sender.id !== client.id) {
        const username = chalk[sender.color].underline(sender.nick);
        client.write(`${username}: `);
        client.write(message);
      }
    }
  });

  // Handle commands
  this.on('command', (sender, rawCommand) => {
    rawCommand = rawCommand.toString().slice(1).trim().split(' ');
    const command = rawCommand[0];
    const args = rawCommand.splice(1);

    if (command === 'nick') {
      if (args.length !== 1) {
        return sender.write('Usage /nick <your_nickname>\n');
      }

      console.log(`Changing nick from ${sender.nick} to ${args[0]}`);
      this.emit('broadcast', 'server', `${sender.nick} changed their nickname to ${args[0]}\n`);
      sender.nick = args[0];
    }
  });
}

util.inherits(ClientPool, EE);

module.exports = ClientPool;
