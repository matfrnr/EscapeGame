const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'https://g4s5d.22.gremmi.fr',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

let groups = {};

io.on("connection", (socket) => {
    //importer les routes socket
    require('./socket/groupSocket')(io, socket, groups);
    require('./socket/challengeSocket')(io, socket, groups);
    require('./socket/chatSocket')(io, socket, groups);
    require('./socket/pictionarySocket')(io, socket, groups);
    require('./socket/codeNameSocket')(io, socket, groups);
    require('./socket/geoLocationSocket')(io, socket, groups);  // Ajoutez cette ligne

    socket.on('disconnect', () => {
        console.log('❌ WebSocket déconnecté :', socket.id);
    });
});

// Démarrer le serveur WebSocket
const SOCKET_PORT = 3401;
server.listen(SOCKET_PORT, () => {
    console.log(`✅ WebSocket server listening on port ${SOCKET_PORT}`);
});