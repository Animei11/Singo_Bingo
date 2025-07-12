import React, { useState, useEffect } from 'react';
import GenerateCategoriesWheel from '../components/GenerateCategoriesWheel';
import SpotifyAPI from '../components/SpotifyAPI';
import { currentPlayingSongExport } from '../components/SpotifyWebPlayer';
import CheckForBingo from '../components/CheckForBingo';
import EndGame from '../components/EndGame';
import Test1 from '../components/Test1';


export function Test() {
    return (
        <>
            <SpotifyAPI />
            {/* <Test1 /> */}
        </>
    )
}

export default Test;