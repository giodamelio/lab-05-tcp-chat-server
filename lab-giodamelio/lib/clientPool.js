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
    console.log(`Connect: (id: ${id})`);
    client.id = id;
    client.nick = `user_${id}`;
    this.clients[id] = client;

    // Pick out a color for the user
    client.color = colors[Math.floor(colors.length * Math.random())];

    // Send welcome message
    client.write(`Welcome to the ${chalk.underline.bold.white('BEST')} chat server ever!
Run /nick <new_nickname> to set your name
For a list of available commands run /help\n`);

    // Announce user
    this.emit('broadcast', 'server', `${client.nick} has joined\n`);
  });

  // Remove a client
  this.on('disconnect', (client) => {
    console.log(`Disconnect: (id: ${client.id})`);
    delete this.clients[client.id];
    this.emit('broadcast', 'server', `${client.nick} has quit\n`);
  });

  // Broadcast a message to all clients
  this.on('broadcast', (sender, message) => {
    process.stdout.write(`Message: ${this.formatMessage(sender, message.toString())}`);
    for (const id of Object.keys(this.clients)) {
      const client = this.clients[id];
      if (sender.id !== client.id) {
        client.write(this.formatMessage(sender, message));
      }
    }
  });

  // Handle commands
  this.on('command', (sender, rawCommand) => {
    rawCommand = rawCommand.toString().slice(1).trim().split(' ');
    const command = rawCommand[0];
    const args = rawCommand.splice(1);

    if (command === 'help') {
      const message = `/help\t\t\t\tShows this help
/nick <new_nicknam>\t\tChanges your nickname
/list\t\t\t\tList current users
/quit\t\t\t\tGoodbye
`;
      sender.write(message);
      return;
    } else if (command === 'nick') {
      if (args.length !== 1) {
        sender.write('Usage /nick <your_nickname>\n');
        return;
      }

      console.log(`Command: changing nick from ${sender.nick} to ${args[0]}`);
      this.emit('broadcast', 'server', `${sender.nick} changed their nickname to ${args[0]}\n`);
      sender.nick = args[0];
      return;
    } else if (command === 'quit') {
      sender.end();
      return;
    } else if (command === 'list') {
      const users = [];
      for (const id of Object.keys(this.clients)) {
        const client = this.clients[id];
        users.push(chalk[client.color](client.nick));
      }
      sender.write(`${users.join(', ')}\n`);
    } else {
      sender.write(`Command '${command}'is not supported\n`);
      return;
    }
  });
}

util.inherits(ClientPool, EE);

ClientPool.prototype.formatMessage = function (sender, message) {
  if (sender === 'server') {
    const serverName = chalk.white.underline.bold('SERVER');
    return `${serverName}: ${message}`;
  }

  const username = chalk[sender.color].underline(sender.nick);
  return `${username}: ${message}`;
};


module.exports = ClientPool;
