// Overview (COMPLETED): Checks for bingo in the bingo playlist     
import { useState } from 'react';
import winner from "../pictures/winner.jpg";
let countRow = [0, 0, 0, 0, 0];
let countColumn = [0, 0, 0, 0, 0];
let countUpDiagonal = 0;
let countDownDiagonal = 0;



export default function CheckForBingo(row, col) {
    if ((row) === col) {
        countDownDiagonal++;
        if (row === 2) {
            countUpDiagonal++;
        }
    } else if (row + col === 4) {
        countUpDiagonal++;
    }
    countRow[row] += 1;
    countColumn[col] += 1;

    console.log(`CHECK FOR BINGO Row: ${row}\nColumn:${col}`);
    console.log(`Row: ${countRow}\nColumn:${countColumn}\nDiagonal Up:${countUpDiagonal}\nDiagonal Down: ${countDownDiagonal}`);

    if (countRow.includes(5) || // Bingo for column 
        countColumn.includes(5) || // Bingo for row 
        countUpDiagonal === 5 || // Bingo for diagonal down (bottom left corner to top right corner)
        countDownDiagonal === 5) { // Bingo for diagonal up (top left corner to bottom right corner)
        return true;
    }
    return false;
};
