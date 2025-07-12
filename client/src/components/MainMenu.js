// Overview (COMPLETED): Displays a navigation bar for all the different js files 
import { Home } from '../pages/Home';
import { PlayerLogin } from '../pages/PlayerLogin';
import { BingoCard } from '../pages/BingoCard';
import { Test } from '../pages/Test';
import { Layout } from '../pictures/Layout';
import { Routes, Route } from 'react-router-dom';
export default function MainMenu() {
    return (
        <>
            <Routes>
                {/* Parent route */}
                <Route element={<Layout />}>
                    {/* Children routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/PlayerLogin" element={<PlayerLogin />} />
                    <Route path="/BingoCard" element={<BingoCard />} />
                    <Route path="/Test" element={<Test />} />
                    <Route path="/callback" element={<Test />} />
                </Route>
            </Routes>
        </>
    );
};
