import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import { useCountdown } from '../contexts/CountdownContext.jsx';
import timer from '../assets/images/timer.png';
import "../assets/styles/timer.css";

const Countdown = () => {
    const { setIsCountdownFinished } = useCountdown();
    const targetDate = new Date("2024-01-24T13:30:00").getTime();

    const handleComplete = () => {
        setIsCountdownFinished(true);
    };


    return (
        <div className="test">
            <div className="countdown-container">
                <h2 className="TitleTimer">Soyez <span className='text-primary'>prêt</span>, <br></br>Le <span
                    className='text-primary'>jeu</span> va commencer</h2>
                <FlipClockCountdown
                    to={targetDate}
                    className="responsive-flip-clock"
                    onComplete={handleComplete}
                    digitBlockStyle={{
                        color: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                        width: '35px',
                        height: '50px',
                        fontSize: '1.5rem',
                    }}
                    labelStyle={{
                        fontSize: '0.8rem', color: '#fff', fontWeight: 'bold',
                    }}
                />
                <img src={timer} alt="BDE Comic" className="imageTimer" />
            </div>
        </div>);
};

export default Countdown;
