// Overview (INCOMPLETE): Generates lobby code, does validation check, takes username
// Issues: Can't really test this till I have AWS and IONOS domain connected 
import io from 'socket.io-client';
import { useState, useEffect } from 'react';
import { websiteLink } from '../pages/Home';
import '../css/Form.css';

const socket = io(websiteLink);
// Generate a random lobby code of 4 digits 
const lobbyCode = Math.floor(Math.random() * 1000) + 1000;
// const lobbyCode = 1234;

export default function GenerateLobbyCode() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");


  const joinRoom = () => {
    // Checks if Lobby code entered is valid 
    // Room is a string, lobbyCode is not mutable so cast it instead of reassigning it 
    if (room.trim() !== String(lobbyCode)) {
      alert("Lobby not found. Please reenter lobby code.");
    } else {
      socket.emit("join_room", lobbyCode);
      alert(`Room ${lobbyCode} joined`);
    }
    socket.emit("join_room", lobbyCode);
  };
  // Saves changes to username 
  const changeUsername = (event) => {
    setUsername(event.target.value);
  };

  return (
    <>
      <h4 align="center">Username: {username}</h4>
      <div className="box">
        <h3>Lobby Code: {lobbyCode}</h3>
        {/* Asks player for a username */}
        <input className="circular-input" type="text" value={username} placeholder='Username...' onChange={(e) => setUsername(e.target.value)} />
        {/* Asks player for lobby code */}
        <input className="circular-input" placeholder="Lobby Code..." onChange={(e) => setRoom(e.target.value)} />
        <button className="button" onClick={joinRoom}>Join Room</button>
      </div>
    </>
  );
}