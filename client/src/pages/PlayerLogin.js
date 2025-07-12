import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { websiteLink } from './Home';
import GenerateLobbyCode from '../components/GenerateLobbyCode';
import PlayerCustomization from '../components/PlayerCustomization';

const socket = io.connect(websiteLink);


export function PlayerLogin() {
    return (
        <>
            <PlayerCustomization />
            <GenerateLobbyCode />
        </>
    )
}