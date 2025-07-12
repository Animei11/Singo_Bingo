// Overview (COMPLETED?): Spotify API plays songs as back up if Youtube API quota is met 
// Comments: As far as I know it's good. Until I have to add anything else from Spotify API should be good 
import React, { useState, useEffect } from 'react';
import { loginToSpotify, logout, isAuthenticated, makeSpotifyRequest, getTokenFromUrl, setToken, getPlaylistById, getCurrentDeviceId, transferPlayback, getAvailableDevices, fetchPlaylist } from './spotifyAuth';
import SpotifyWebPlayer from './SpotifyWebPlayer.js';
import '../css/Form.css';


export default function SpotifyAPI() {
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const { access_token } = getTokenFromUrl();
            if (access_token) {
                setToken(access_token);
                window.location.hash = '';
            }
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchUserProfile();
        }
    }, []);

    const handleLogin = () => {
        loginToSpotify();
    };

    const handleLogout = () => {
        const result = logout();
        if (result.success) {
            setUserProfile(null);
            setError(null);
            // Force a re-render to update the UI
            window.location.reload();
        } else {
            setError('Failed to logout: ' + result.error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const data = await makeSpotifyRequest('/me');
            setUserProfile(data);
            setError(null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to fetch user profile');
        }
    };


    return (
        <div className="box">
            <h3>Log Into Spotify Premium Account</h3>

            {!isAuthenticated() ? (<p>Please login</p>) : (
                <div>
                    {error && (
                        <div>
                            {error}
                        </div>
                    )}

                    {userProfile && (
                        <div>
                            <p><strong>Spotify Account Username:</strong> {userProfile.display_name}</p>
                        </div>
                    )}
                </div>

            )}
            <button className="button" onClick={handleLogin} disabled={isAuthenticated()}> Login with Spotify </button>
            <button className="button" onClick={handleLogout} disabled={!isAuthenticated()}> Logout </button>
            <div>
                <SpotifyWebPlayer />
            </div>
        </div>
    );
}