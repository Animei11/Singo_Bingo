// Overview (COMPLETED?): Authorizes Spotify API 
// Used for login, logout, and making API calls 
// Comments: As far as I know it's good. Until I have to add anything else from Spotify API should be good 
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control'
].join(' ');

export const loginToSpotify = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
};

export const getTokenFromUrl = () => {
    return window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial, item) => {
            let parts = item.split('=');
            initial[parts[0]] = decodeURIComponent(parts[1]);
            return initial;
        }, {});
};

export const setToken = (token) => {
    window.location.hash = '';
    window.localStorage.setItem('spotify_token', token);
};

export const getToken = () => {
    return window.localStorage.getItem('spotify_token');
};

export const logout = () => {
    try {
        window.localStorage.removeItem('spotify_token');
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        return { success: true };
    } catch (error) {
        console.error('Error during logout:', error);
        return { success: false, error: error.message };
    }
};

export const isAuthenticated = () => {
    return !!getToken();
};

export const makeSpotifyRequest = async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
        throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return null;
};

export const getPlaylistById = async (playlistId) => {
    return await makeSpotifyRequest(`/playlists/${playlistId}/tracks?fields=items(track(name,artists))`);
};

export const fetchPlaylist = async (playlistId) => {
    let songs = [];
    let artists = [];
    try {
        const playlist = await getPlaylistById(playlistId);

        if (!playlist || !playlist.items) {
            console.error('Invalid playlist data received');
            return [[], []];
        }

        for (let i = 0; i < playlist.items.length; i++) {
            const item = playlist.items[i];
            if (item?.track?.name && item?.track?.artists?.[0]?.name) {
                songs.push(item.track.name);
                artists.push(item.track.artists[0].name);
            }
        }
        return [songs, artists];
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return [[], []];
    }
};

export const getAvailableDevices = async () => {
    try {
        const response = await makeSpotifyRequest('/me/player/devices');
        console.log(response.devices);
        return response.devices;
    } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
    }
};

export const getCurrentDeviceId = async () => {
    try {
        const devices = await getAvailableDevices();
        const activeDevice = devices.find(device => device.is_active);
        console.log(activeDevice.id);
        return activeDevice ? activeDevice.id : null;
    } catch (error) {
        console.error('Error getting current device:', error);
        throw error;
    }
};

export const transferPlayback = async (deviceId) => {
    try {
        await makeSpotifyRequest('/me/player', {
            method: 'PUT',
            body: JSON.stringify({
                device_ids: [deviceId],
                play: true
            })
        });
    } catch (error) {
        console.error('Error transferring playback:', error);
        throw error;
    }
};