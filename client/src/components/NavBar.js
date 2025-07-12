// Overview (COMPLETED): Creates a navigation bar for all the different js files 
import { Link } from 'react-router-dom'


export function NavBar() {
    return (
        <>
            <Link to="/">
                <button>Home</button>
            </Link>
            <Link to="/PlayerLogin">
                <button>Player Login</button>
            </Link>
            <Link to="/BingoCard">
                <button>Bingo Card</button>
            </Link>
            <Link to="/Test">
                <button>Test</button>
            </Link>
        </>
    )
}