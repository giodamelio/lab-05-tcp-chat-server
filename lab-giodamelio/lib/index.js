'use strict';
const net = require('net');

const server = net.createServer((socket) => {
  socket.write('Hello World');
  socket.end();
});

server.listen(3000);
