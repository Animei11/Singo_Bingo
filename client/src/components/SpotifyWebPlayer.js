// Overview (COMPLETED?): Spotify Web Playback SDK  to play songs on website 
// Comments: As far as I know it's good. Until I have to add anything else from Spotify API should be good 
import React, { useEffect, useState } from 'react';
import { makeSpotifyRequest } from './spotifyAuth';
import '../css/Form.css';
// At the top of the file, add export
export let currentPlayingSongExport = null;

const SpotifyWebPlayer = () => {
    const [player, setPlayer] = useState(null);
    const [isActive, setIsActive] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const [totalTime, setTotalTime] = useState(null);
    const [deviceId, setDeviceId] = useState(null);
    const [error, setError] = useState(null);
    const [playlistId, setPlaylistId] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDelay, setIsDelay] = useState(false);
    const [currentPlayingSong, setCurrentPlayingSong] = useState(null);
    const [playlistTimer, setPlaylistTimer] = useState(null);
    const [delayTimer, setDelayTimer] = useState(null);

    const stopPlaylist = async () => {
        try {
            // Clear any existing timers
            if (playlistTimer) {
                clearInterval(playlistTimer);
                setPlaylistTimer(null);
            }
            if (delayTimer) {
                clearInterval(delayTimer);
                setDelayTimer(null);
            }

            // Pause the current track
            if (deviceId) {
                await makeSpotifyRequest('/me/player/pause', {
                    method: 'PUT',
                    body: JSON.stringify({
                        device_id: deviceId
                    })
                });
            }

            // Reset all states
            setIsPlaying(false);
            setTimeLeft(null);
            setTotalTime(null);
            setCurrentPlayingSong(null);
            currentPlayingSongExport = null;
            setIsDelay(false);
        } catch (error) {
            console.error('Error stopping playlist:', error);
            setError('Failed to stop playlist');
        }
    };

    // Export the stopPlaylist function
    window.stopPlaylist = stopPlaylist;

    useEffect(() => {
        // Check if script is already loaded
        const existingScript = document.getElementById('spotify-player');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'spotify-player';
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            // Add load error handling
            script.onerror = () => {
                setError('Failed to load Spotify SDK');
                console.error('Failed to load Spotify SDK');
            };

            document.body.appendChild(script);
        }

        const token = localStorage.getItem('spotify_token');

        // Add token validation check
        if (!token) {
            setError('No Spotify token found. Please log in again.');
            console.error('No Spotify token found');
            return;
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            // Add debug logging
            console.log('SDK Ready, attempting to create player...');
            console.log('Token available:', !!token);

            const spotifyPlayer = new window.Spotify.Player({
                name: 'Web Playback SDK Player',
                getOAuthToken: cb => {
                    console.log('Getting OAuth token...');
                    cb(token);
                },
                volume: 0.5
            });

            // Add more error listeners
            spotifyPlayer.addListener('initialization_error', ({ message }) => {
                console.error('Failed to initialize:', message);
                setError(`Initialization error: ${message}`);
            });

            spotifyPlayer.addListener('authentication_error', ({ message }) => {
                console.error('Failed to authenticate:', message);
                setError(`Authentication error: ${message}. Please try logging in again.`);
                // Optionally clear the invalid token
                localStorage.removeItem('spotify_token');
            });

            spotifyPlayer.addListener('account_error', ({ message }) => {
                console.error('Account error:', message);
                setError(`Account error: ${message}`);
            });

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
                setPlayer(spotifyPlayer);
                setError(null); // Clear any previous errors
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
                setDeviceId(null);
            });

            spotifyPlayer.addListener('player_state_changed', state => {
                if (state) {
                    setCurrentTrack(state.track_window.current_track);
                    setIsActive(true);
                }
            });

            // Add connect error handling
            console.log('Attempting to connect...');
            spotifyPlayer.connect().then(success => {
                if (success) {
                    console.log('Successfully connected to Spotify!');
                } else {
                    setError('Failed to connect to Spotify');
                    console.error('Failed to connect to Spotify');
                }
            });
        };

        // Cleanup
        return () => {
            if (player) {
                player.disconnect();
            }
        };
    }, []);

    const playPlaylist = async (playlistId) => {
        if (!deviceId) {
            console.log('No device ID available');
            return;
        }

        try {
            // Fetch the playlist tracks
            const response = await makeSpotifyRequest(`/playlists/${playlistId}/tracks`);
            let tracks = response.items.map(item => item.track);

            if (tracks.length === 0) {
                setError('Playlist is empty');
                return;
            }

            // Always shuffle tracks
            tracks = [...tracks].sort(() => Math.random() - 0.5);

            console.log(`Starting playlist with ${tracks.length} tracks`);

            // Play the first track
            await makeSpotifyRequest('/me/player', {
                method: 'PUT',
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false
                })
            });

            let currentIndex = 0;
            const playNextTrack = async () => {
                if (currentIndex < tracks.length) {
                    const track = tracks[currentIndex];
                    console.log(`Playing track ${currentIndex + 1}/${tracks.length}: ${track.name}`);

                    // Update current song information and export
                    const songInfo = {
                        name: track.name,
                        artist: track.artists[0].name,
                        albumArt: track.album.images[0]?.url,
                        trackNumber: currentIndex + 1,
                        totalTracks: tracks.length,
                        uri: track.uri
                    };
                    setCurrentPlayingSong(songInfo);
                    currentPlayingSongExport = songInfo;
                    setIsDelay(false);

                    try {
                        await makeSpotifyRequest('/me/player/play', {
                            method: 'PUT',
                            body: JSON.stringify({
                                device_id: deviceId,
                                uris: [track.uri]
                            })
                        });

                        let timeRemaining = 10;
                        setTimeLeft(timeRemaining);
                        setTotalTime(10);

                        const timer = setInterval(async () => {
                            timeRemaining--;
                            setTimeLeft(timeRemaining);

                            if (timeRemaining <= 0) {
                                clearInterval(timer);
                                setTimeLeft(null);
                                setTotalTime(null);

                                await makeSpotifyRequest('/me/player/pause', {
                                    method: 'PUT',
                                    body: JSON.stringify({
                                        device_id: deviceId
                                    })
                                });

                                setIsDelay(true);
                                let delayTime = 5;

                                const delayTimer = setInterval(() => {
                                    setTimeLeft(delayTime);
                                    setTotalTime(5);
                                    delayTime--;

                                    if (delayTime < 0) {
                                        clearInterval(delayTimer);
                                        currentIndex++;
                                        playNextTrack();
                                    }
                                }, 1000);
                                setDelayTimer(delayTimer);
                            }
                        }, 1000);
                        setPlaylistTimer(timer);
                    } catch (error) {
                        console.error(`Error playing track ${track.name}:`, error);
                        currentIndex++;
                        setIsDelay(true);
                        setTimeout(playNextTrack, 20000);
                    }
                } else {
                    console.log('Playlist finished');
                    setTimeLeft(null);
                    setTotalTime(null);
                    setCurrentPlayingSong(null);
                    currentPlayingSongExport = null;
                    setIsDelay(false);
                }
            };
            playNextTrack();
        } catch (error) {
            console.error('Error playing playlist:', error);
            setError('Failed to play playlist');
        }
    };

    return (
        <div>
            <div>
                <h3>Debug Info:</h3>
                <p>SDK Loaded: {window.Spotify ? '✅' : '❌'}</p>
                <p>Token Present: {localStorage.getItem('spotify_token') ? '✅' : '❌'}</p>
                <p>Player Created: {player ? '✅' : '❌'}</p>
                <p>Device ID: {deviceId || 'Not set ❌'}</p>
                <p>Player Active: {isActive ? '✅' : '❌'}</p>
                {error && (
                    <p>Error: {error}</p>
                )}
            </div>

            {/* Regular Player UI */}
            <div>
                <input
                    type="text"
                    placeholder="Enter Spotify Playlist ID..."
                    onChange={(e) => setPlaylistId(e.target.value)}
                />
                <button
                    onClick={() => {
                        if (isPlaying) {
                            stopPlaylist();
                        } else {
                            // Start playlist
                            setIsPlaying(true);
                            playPlaylist(playlistId);
                        }
                    }}
                    disabled={!deviceId}
                >
                    {isPlaying ? 'Stop Playlist' : 'Play Playlist'}
                </button>
            </div>
            {/* Countdown display */}
            {timeLeft !== null && (
                <div>
                    <div>
                        <div
                            style={{ width: `${(timeLeft / totalTime) * 100}%` }}
                        />
                        <div>
                            <span>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>
                    <div>
                        {isDelay
                            ? `Waiting ${timeLeft} seconds before next track...`
                            : `Playing "${currentPlayingSong?.name}" (${timeLeft}s remaining)`
                        }
                    </div>
                </div>
            )}

            {/* Current track display */}
            {currentTrack && (
                <div>
                    <div>
                        <div>Song: {currentTrack.name}</div>
                        <div>Artist: {currentTrack.artists[0].name}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpotifyWebPlayer; 