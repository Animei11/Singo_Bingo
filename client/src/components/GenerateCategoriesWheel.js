// Overview (INCOMPLETE): Generate a wheel with 4 generes of music 
// Issues: Doesn't work in general
import React, { useState } from 'react';
import '../css/GenerateCategoriesWheel.css';

const categories = {
    "2010's Pop": "62HaO9yiASf682wiFI9ps7",
    "Musicals": "46UCqirkemwVQRKMOQZb0c",
    "Christian Music": "1AyJUoROiYGanvapK12ieh",
    "Epic: The Musical": "3sdEH7HfFE3d4xry5RnnLr"
};


const GenerateCategoriesWheel = () => {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    const getSelectedCategory = () => {
        // Normalize to positive degrees and align with ticker at top
        let position = (360 - (rotation % 360)) % 360;

        // Debug logs
        console.log('Raw rotation:', rotation);
        console.log('Normalized position:', position);

        if (position >= 0 && position < 90) return "2010's Pop";
        if (position >= 90 && position < 180) return "Musicals";
        if (position >= 180 && position < 270) return "Christian Music";
        return "Epic: The Musical";
    };

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        const newRotation = rotation + 2000 + Math.random() * 3000;
        setRotation(newRotation);

        setTimeout(() => {
            setIsSpinning(false);
            const selectedCategory = getSelectedCategory();
            console.log('Selected category:', selectedCategory);
        }, 3000);
    };

    return (
        <div className="wheel-container">
            <div className="ticker"></div>
            <div
                className="wheel"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
            >
                {Object.keys(categories).map((category, index) => (
                    <div
                        key={category}
                        className="wheel-section"
                    >
                        <span>{category}</span>
                    </div>
                ))}
            </div>
            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="spin-button"
            >
                SPIN
            </button>
        </div>
    );
};

export default GenerateCategoriesWheel;