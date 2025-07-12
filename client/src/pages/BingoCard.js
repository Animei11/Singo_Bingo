import GenerateBingoCard from '../components/GenerateBingoCard';
import EndGame from '../components/EndGame';
import PlayerCustomization from '../components/PlayerCustomization';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function BingoCard() {
    const [showComponents, setShowComponents] = useState(true);
    const [hasBingo, setHasBingo] = useState(false);
    const location = useLocation();
    const gameKey = location.state?.gameKey || 0;

    useEffect(() => {
        if (hasBingo && window.stopPlaylist) {
            window.stopPlaylist();
            setTimeout(() => {
                setShowComponents(false);
            }, 5000);
        }
    }, [hasBingo]);

    return (
        <>
            <div className="BingoCard">
                {showComponents && (
                    <>
                        <PlayerCustomization />
                        <GenerateBingoCard key={gameKey} onBingoChange={setHasBingo} />
                    </>
                )}
            </div>
            {!showComponents && <EndGame />}
        </>
    );
}

