// Makes it to where you don't have to reinitialize the navbar in every js file 
import { NavBar } from "../components/NavBar";
import { Outlet } from "react-router-dom";
import "../css/Layout.css";

export function Layout() {
    return (
        <>
            <div className="floating-note"></div>
            <div className="floating-note"></div>
            <div className="floating-note"></div>
            <div className="floating-note"></div>
            <div className="floating-note"></div>
            <div className="floating-clef"></div>
            <div className="floating-clef"></div>
            <div className="floating-clef"></div>
            <div className="floating-bass"></div>
            <div className="floating-bass"></div>
            <NavBar />
            <main>
                <Outlet />
            </main>
        </>
    )
}