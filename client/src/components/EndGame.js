// Overview (INCOMPLETE): Shows menu at the end of game, providing options to play again or return to main menu 
// Issues: Doesn't restart game if new game is clicked
import { useNavigate } from 'react-router-dom';
import '../css/Form.css';

export default function EndGame() {
    const navigate = useNavigate();
    return (
        <>
            <div className="box">
                <h2>Game Ended</h2>
                <button className="button" onClick={() => window.location.reload()}>
                    New Game
                </button>
                <button className="button" onClick={() => navigate('/')}>
                    Return to Main Menu
                </button>
            </div >
        </>
    )
}