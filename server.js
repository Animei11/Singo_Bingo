const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { Server } = require('socket.io');
const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app)

// Serve static files from the client/build directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Create HTTP server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('create_room', (roomCode) => {
        socket.join(roomCode);
        io.to(roomCode).emit('room_created', roomCode);
    });

    socket.on('join_room', (roomCode) => {
        socket.join(roomCode);
        io.to(roomCode).emit('user_joined', socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Listens for server port
server.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
