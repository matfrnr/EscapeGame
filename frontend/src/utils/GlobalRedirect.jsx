import {useEffect} from "react";
import {useNavigate, Outlet} from "react-router-dom";
import {useCountdown} from "../contexts/CountdownContext";
import {useLobby} from "../contexts/LobbyContext";
import {useChallenge} from "../contexts/ChallengeContext";
import {useAuth} from "../contexts/AuthContext.jsx";

const GlobalRedirect = () => {
    const {isCountdownFinished} = useCountdown();
    const {isInLobby, setIsInLobby} = useLobby();
    const {currentStep, setCurrentStep, completedChallenges} = useChallenge();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();


    useEffect(() => {

        if (!isCountdownFinished) {
            navigate('/countdown', {replace: true});
        } else if (!isAuthenticated && isCountdownFinished) {
            navigate('/home', {replace: true});
        } else if (!isInLobby && isAuthenticated) {
            navigate('/dashboard', {replace: true});
        } else if (currentStep === 0 && isInLobby) {
            navigate('/lobby', {replace: true});
        } else if (currentStep !== 0 && isInLobby) {
            navigate(`/challenge/${currentStep}`, {replace: true});
        }

    }, [isCountdownFinished, isInLobby, currentStep, navigate, setCurrentStep]);

    return <Outlet/>;
};

export default GlobalRedirect;
