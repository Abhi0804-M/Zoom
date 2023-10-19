const socketio = require('socket.io');

function setupSocket(server) {
  const io = socketio(server);

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for chat message events
    socket.on('chat message', (msg) => {
      console.log('Message: ' + msg);
      io.emit('chat message', msg); // Broadcast the message to all connected users
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
}

module.exports = setupSocket;
