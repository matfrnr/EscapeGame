import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../../contexts/ChallengeContext.jsx';

const NextChallenge = () => {
    const navigate = useNavigate();
    const { nextStep } = useChallenge();

    useEffect(() => {
        nextStep();
    }, [nextStep, navigate]);

    return (
        <p className={
          "text-center text-lg font-semibold text-white p-4"
        }>
            Redirection vers le prochain défi...
        </p>
    );
};

export default NextChallenge;