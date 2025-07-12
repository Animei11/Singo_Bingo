// In your React component
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import "../css/Form.css";
import { websiteLink } from '../pages/Home';

export default function GameRoom() {
    const [roomCode, setRoomCode] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const socket = io(websiteLink);

    useEffect(() => {
        // Listen for    room creation
        socket.on('room_created', (code) => {
            setRoomCode(code);
        });

        // Listen for track changes
        socket.on('track_change', (data) => {
            setCurrentTrack(data.track);
            setPlaybackPosition(data.position);
        });

        // Listen for playback updates
        socket.on('playback_update', (data) => {
            setPlaybackPosition(data.position);
        });

        return () => {
            socket.off('room_created');
            socket.off('track_change');
            socket.off('playback_update');
        };
    }, []);

    const createRoom = (playlistId) => {
        console.log("Creating room with playlist ID:", playlistId);
        socket.emit('create_room', playlistId);
    };

    const joinRoom = (roomCode) => {
        socket.emit('join_room', roomCode);
    };

    return (
        <div className="box">
            <button className="button" onClick={() => createRoom('3sdEH7HfFE3d4xry5RnnLr')}>Create Room</button>
            {currentTrack && (
                <div>
                    <h3>Now Playing: {currentTrack.name}</h3>
                    <p>Position: {playbackPosition} seconds</p>
                </div>
            )}
        </div>
    );
}