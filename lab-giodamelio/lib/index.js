'use strict';
const createServer = require('./server');

const server = createServer(process.stdout);
server.listen(3000);
console.log('Chat server listening at tcp://localhost:3000');
