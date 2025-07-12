// Overview (INCOMPLETE): Creates 6x5 grid for bingo card and validates user clicks with songs 
// Issues: Fix playlistID to sync with Spotify, so I dont' have to manually change it 
import '../css/GenerateGrid.css';
import CheckForBingo from './CheckForBingo';
import { currentPlayingSongExport } from './SpotifyWebPlayer';
import { fetchPlaylist } from './spotifyAuth';
import { useState, useEffect, useRef } from 'react';
import winner from "../pictures/winner.jpg";
import ReactConfetti from 'react-confetti';

// Create playlist for Bingo Cards
export const playlistId = '4w7MC9I9sIlSI2uR3mJVl8';
// https://open.spotify.com/playlist/4w7MC9I9sIlSI2uR3mJVl8?si=f46d83af9ec940ed
// Hardcoded to save quota calls 
// const playlist = ["Playground", "Broken Dreams of Boulevard", "ME!", "I Ain't Worried", "Way Up",
//     "Take Over", "Die For You", "What's up Danger", "Can't Slow Me Down",
//     "Villian", "Everything Black", "More", "Ghost", "Snakes",
//     "Rise", "El Dorado", "Phoenix", "Figure You Out", "Born For This",
//     "Ashes", "Dirty Little Animals", "Familia", "Burn It All Down", "Dynasties & Dystopia",
//     "Come Play", "Paint The Town Blue"];
// Actually calls playlist from Spotify API 
const [playlist, artist] = await fetchPlaylist(playlistId);

// Picks songs to go on BingoCard 
function generateSongs() {
    let copyOfPlaylist = [...playlist]; // Creates copy of original 
    let bingoCardSongs = []; // Empty array for generating bingo cards  
    let rand = () => Math.floor(Math.random() * copyOfPlaylist.length); // Function to randomly select songs to add to bingoCardSongs
    // Loops till bingoCardSongs has a length of 25 to fill a bingo card
    for (let i = 0; i < 25; i++) {
        if (i === 12) {
            bingoCardSongs.push("FREE SPACE");
            continue;
        }
        let randIndex = rand();
        let randSong = copyOfPlaylist[randIndex];
        bingoCardSongs.push(randSong); // Adds song to bingoCardSongs
        copyOfPlaylist.splice(randIndex, 1); // Removes song from copyOfPlaylist to prevent duplicates 
    };
    // Adds songs to a 2D array to implement into rows and columns 
    // Adds title row 
    const bingoCard2D = [[['B'], ['I'], ['N'], ['G'], ['O']]];
    for (let i = 0; i < 5; i++) {
        bingoCard2D.push(bingoCardSongs.slice(i * 5, i * 5 + 5));
    };
    return bingoCard2D;
};

const GenerateBingoCard = ({ onBingoChange }) => {
    const gridSize = 6;
    const grid = [];
    const [songs] = useState(() => generateSongs());
    const [markedCells, setMarkedCells] = useState(new Set());
    const [isBingo, setIsBingo] = useState(false);
    const [numberOfGuesses, setNumberOfGuesses] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15); // Add timer state
    const timerStarted = useRef(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!timerStarted.current) {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        setNumberOfGuesses(0);
                        return 15; // Reset to 15 seconds when timer hits 0
                    }
                    return prevTime - 1;
                });
            }, 1000); // Update every second

            return () => clearInterval(timer);
        }
    }, [timerStarted]);

    useEffect(() => {
        console.log(`Number of guesses: ${numberOfGuesses}`);
    }, [numberOfGuesses]);

    const validSong = (clickedSong, row, col) => {
        // Stops errors from happening if Spotify hasn't loaded yet 
        if (!currentPlayingSongExport) {
            return isBingo;
        }

        // Starts timer when first song is played
        if (!timerStarted.current) {
            timerStarted.current = true;
        }

        // Special case for free space
        if (clickedSong === "FREE SPACE") {
            setMarkedCells(prev => new Set([...prev, `${row}-${col}`]));
            if (CheckForBingo(row, col)) {
                setIsBingo(true);
                onBingoChange(true);
            }
            return isBingo;
        }

        // Won't allow players more than 2 guesses 
        if (numberOfGuesses > 1) {
            return isBingo;
        }

        // Get the current song name directly
        const currentSong = currentPlayingSongExport.name;

        // Updates state
        setNumberOfGuesses(prev => prev + 1);

        // Validates song clicked and checks for bingo
        if (clickedSong.toLowerCase() === currentSong.toLowerCase()) {
            setMarkedCells(prev => new Set([...prev, `${row}-${col}`]));
            if (CheckForBingo(row, col)) {
                setIsBingo(true);
                onBingoChange(true);
            }
        }
        return isBingo;
    };

    // Create the bingo card rows
    for (let i = 0; i < gridSize; i++) {
        const row = [];
        for (let j = 0; j < gridSize - 1; j++) {
            // Title row 
            if (i === 0) {
                row.push(
                    <div
                        className="cell"
                        key={`Title Row Letter: ${songs[i][j]}`}
                    >
                        {songs[i][j]}
                    </div>
                );
                continue;
            }
            const cellKey = `${i - 1}-${j}`;
            // Cells for songs 
            row.push(
                <div
                    className={`cell ${markedCells.has(cellKey) ? 'marked' : ''}`}
                    key={cellKey}
                    // Prevents people from clicking the same cell and counting the same song multiple times towards bingo 
                    onClick={!markedCells.has(cellKey) ? () => validSong(songs[i][j], i - 1, j) : undefined}
                >
                    {songs[i][j]}
                </div>
            );
        }
        grid.push(<div className="row" key={i}>{row}</div>);
    }

    return (
        <div>
            {isBingo && <ReactConfetti
                width={windowSize.width}
                height={windowSize.height}
                numberOfPieces={200}
                recycle={false}
                run={true}
            />}
            <div className="timer">Time left: {timeLeft}s</div>
            <div className="grid">{grid}</div> {/* Prints bingo card*/}
            {isBingo && (
                <div className="winner-overlay"> {/* Winner banner */}
                    <img
                        src={winner}
                        alt="winner"
                        className="winner-image"
                    />
                </div>
            )}
        </div>
    );
};
export default GenerateBingoCard;