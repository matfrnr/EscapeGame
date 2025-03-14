import {createContext, useState, useContext, useEffect} from 'react';
import {socket} from "../socket.js";
import {useLobby} from "./LobbyContext.jsx";
import {useAuth} from "./AuthContext.jsx";

const ChallengeContext = createContext();

export const ChallengeProvider = ({children}) => {
    const {groupCode, groupMembers} = useLobby();
    const {userInfo} = useAuth();
    const TOTAL_CHALLENGES = 12;

    // Track completed challenges to prevent repetition
    const [completedChallenges, setCompletedChallenges] = useState(() => {
        const saved = localStorage.getItem('completedChallenges');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem('currentStep');
        return saved !== null ? parseInt(saved) : 0;
    });

    const [isQrCodeScanned, setIsQrCodeScanned] = useState(() => {
        const saved = localStorage.getItem('isQrCodeScanned');
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [shuffledList, setShuffledList] = useState(() => {
        const saved = localStorage.getItem('shuffledList');
        if (saved) {
            return JSON.parse(saved);
        }
        const newList = Array.from({length: TOTAL_CHALLENGES}, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);
        localStorage.setItem('shuffledList', JSON.stringify(newList));
        return newList;
    });

    const [key, setKey] = useState(() => {
        const saved = localStorage.getItem('key');
        return saved || '';
    });

    const [currentKey, setCurrentKey] = useState(() => {
        const saved = localStorage.getItem('currentKey');
        return saved || '';
    });

    const generateRandomKey = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({length: TOTAL_CHALLENGES},
            () => characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    };

    useEffect(() => {

        const isGameMaster = groupMembers.some(
          member => member.role === 1 && member.id === userInfo.id
        );

        if(!isGameMaster && !key) {
            socket.emit('request_key', { groupCode: groupCode});
        }

    }, [groupCode, groupMembers, key, userInfo.id]);

    // Socket connection and event handlers
    useEffect(() => {
        socket.emit('join_challenge', {
            groupCode,
            id: userInfo.id,
            username: userInfo.username,
            profil_picture: userInfo.profil_picture
        });

        socket.on('full_key', ({ key }) => {
            setKey(key);
            localStorage.setItem('key', key);
        });

        const handlers = {
            update_step: (newStep) => {
                setCurrentStep(newStep);
                // Update completed challenges when receiving a new step
                setCompletedChallenges(prev => {
                    const updated = [...new Set([...prev, newStep])]; // Ensure uniqueness
                    localStorage.setItem('completedChallenges', JSON.stringify(updated));
                    return updated;
                });
                setIsQrCodeScanned(false);
                localStorage.setItem('currentStep', newStep);
                localStorage.setItem('isQrCodeScanned', 'false');
            },
            qr_code_scanned: () => {
                setIsQrCodeScanned(true);
                localStorage.setItem('isQrCodeScanned', 'true');
            },
            update_key: ({updatedCurrentKey}) => {
                setCurrentKey(updatedCurrentKey);
                localStorage.setItem('currentKey', updatedCurrentKey);
            },
            // Add handler for syncing completed challenges across clients
            sync_completed_challenges: (challenges) => {
                setCompletedChallenges(challenges);
                localStorage.setItem('completedChallenges', JSON.stringify(challenges));
            }
        };

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.keys(handlers).forEach(event => {
                socket.off(event);
            });
        };
    }, [groupCode, userInfo.id, userInfo.username, userInfo.profil_picture, groupMembers]);

    const nextStep = () => {
        // Get the next unplayed challenge from the shuffled list
        const nextUnplayedChallenge = shuffledList.find(challenge =>
            !completedChallenges.includes(challenge)
        );
        setIsQrCodeScanned(false);

        if (nextUnplayedChallenge) {
            // Update completed challenges
            const updatedCompleted = [...completedChallenges, nextUnplayedChallenge];
            setCompletedChallenges(updatedCompleted);
            localStorage.setItem('completedChallenges', JSON.stringify(updatedCompleted));

            // Update current step
            setCurrentStep(nextUnplayedChallenge);
            localStorage.setItem('currentStep', nextUnplayedChallenge);

            // Emit socket events
            socket.emit('next_step', { groupCode, newStep: nextUnplayedChallenge });
            socket.emit('sync_completed_challenges', { groupCode, challenges: updatedCompleted });

            // Update key if the user is game master
            const isGameMaster = groupMembers.some(
                member => member.role === 1 && member.id === userInfo.id
            );

            if (key && currentStep > 0) {
                const challengeIndex = updatedCompleted.length - 1;
                const updatedCurrentKey = key.slice(0, challengeIndex);
                setCurrentKey(updatedCurrentKey);
                socket.emit('update_key', { groupCode, updatedCurrentKey });
                localStorage.setItem('currentKey', updatedCurrentKey);
            }
        } else {

            if (completedChallenges.length === 12) {

                const lastCharacter = key ? key.slice(-1) : "";
                const updatedCurrentKey = currentKey + lastCharacter;
                setCurrentKey(updatedCurrentKey);
                socket.emit('update_key', { groupCode, updatedCurrentKey });
                localStorage.setItem('currentKey', updatedCurrentKey);

                // Emit the game completion event
                socket.emit('game_completed', { groupCode });

                // Redirect the current user
                window.location.href = `/ending`;
            } else {
                console.error("Unexpected error: Challenges completed count mismatch.");
            }
        }
    };

    useEffect(() => {
        const handleGameCompleted = () => {
            // Redirect to the ending page when the game is completed
            window.location.href = `/ending`;
        };

        socket.on('game_completed', handleGameCompleted);

        return () => {
            socket.off('game_completed', handleGameCompleted);
        };
    }, []);

    const resetGame = () => {
        const newShuffledList = Array.from({length: TOTAL_CHALLENGES}, (_, i) => i + 1)
            .sort(() => Math.random() - 0.5);

        setShuffledList(newShuffledList);
        setCurrentStep(0);
        setIsQrCodeScanned(false);
        setCurrentKey('');
        setCompletedChallenges([]); // Reset completed challenges

        // Reset local storage
        localStorage.setItem('shuffledList', JSON.stringify(newShuffledList));
        localStorage.setItem('currentStep', '0');
        localStorage.setItem('isQrCodeScanned', 'false');
        localStorage.setItem('currentKey', '');
        localStorage.setItem('completedChallenges', '[]');

        const isGameMaster = groupMembers.some(
          member => member.role === 1 && member.id === userInfo.id
        );

        if (isGameMaster && !key) {
            const newKey = generateRandomKey();
            setKey(newKey);
            localStorage.setItem('key', newKey);
            socket.emit('add_key_socket', { groupCode, key: newKey });
        }
    };

    return (
        <ChallengeContext.Provider
            value={{
                currentStep,
                setCurrentStep,
                shuffledList,
                isQrCodeScanned,
                setIsQrCodeScanned,
                nextStep,
                currentKey,
                resetGame,
                completedChallenges
            }}
        >
            {children}
        </ChallengeContext.Provider>
    );
};

export const useChallenge = () => useContext(ChallengeContext);