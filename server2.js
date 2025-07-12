// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();
const server = http.createServer(app);
// Create HTTP server
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Spotify setup
const spotifyApi = new SpotifyWebApi({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: 'YOUR_REDIRECT_URI'
});

// Store active rooms and their playback states
const rooms = {};

// Serve static files from the client/build directory
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Generate room code
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Socket.io
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    socket.on('create_room', (playlistId) => {
        const roomCode = generateRoomCode();

        // Initialize room with playlist
        rooms[roomCode] = {
            playlistId: playlistId,
            players: [socket.id],
            currentTrack: null,
            playbackPosition: 0
        };

        socket.join(roomCode);
        socket.emit('room_created', roomCode);

        // Start playback for this room
        startPlayback(roomCode, playlistId);
    });

    socket.on('join_room', (roomCode) => {
        // Check if room exists
        if (rooms[roomCode]) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('user_joined', socket.id);
        } else {
            // Room doesn't exist
            socket.emit('room_not_found');
        }
    });

    socket.on('disconnect', () => {
        // Clean up rooms when players leave
        for (const roomCode in rooms) {
            rooms[roomCode].players = rooms[roomCode].players.filter(id => id !== socket.id);
            // Remove room if empty
            if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Function to handle playback for a room
async function startPlayback(roomCode, playlistId) {
    try {
        // Get playlist tracks
        const data = await spotifyApi.getPlaylistTracks(playlistId);
        const tracks = data.body.items;

        // Start playing first track
        const currentTrack = tracks[0].track;
        rooms[roomCode].currentTrack = currentTrack;

        // Broadcast track info to all players in room
        io.to(roomCode).emit('track_change', {
            track: currentTrack,
            position: 0
        });

        // Set up interval to update playback position
        setInterval(() => {
            rooms[roomCode].playbackPosition += 1;
            io.to(roomCode).emit('playback_update', {
                position: rooms[roomCode].playbackPosition
            });
        }, 1000);
    } catch (error) {
        console.error('Error starting playback:', error);
    }
}

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Listens for server port
server.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
