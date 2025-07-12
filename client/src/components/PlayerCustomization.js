// Overview (INCOMPLETE): Player chooses username and avatar after entering lobby code and validation check
// Issue: Low priority, haven't spent much time with it
import penguin from '../pictures/penguin.png';
import '../css/Avatar.css';

export default function PlayerCustomization() {
    return (
        <>
            <img src={penguin} className="avatar" alt="penguin avatar" />
        </>
    )
}