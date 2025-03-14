import { useState, useEffect } from 'react';
import { useGameContext } from "../../contexts/GameContext";
import { useChallenge } from "../../contexts/ChallengeContext";
import { socket } from "../../socket.js";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Challenges from "./challenges.json";
import Title from "../ui/Title.jsx";
import TransitionModal from "../ui/TransitionModal.jsx";
import Button from "../ui/Button.jsx";

const Challenge6 = () => {
  const { userInfo } = useAuth();
  const { groupCode } = useLobby();
  const [input, setInput] = useState('');
  const [lastInput, setLastInput] = useState('');
  const challengeId = 6;
  const [isCompleted, setIsCompleted] = useState(() => {
    const savedCompleted = localStorage.getItem(`isCompleted_${challengeId}`);
    return savedCompleted ? JSON.parse(savedCompleted) : false;
  });
  const [attempts, setAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem(`attempts_${challengeId}`);
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });
  const [blurLevel, setBlurLevel] = useState(10);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isDeviceOrientationAvailable, setIsDeviceOrientationAvailable] = useState(false);
  const { deductMoney } = useGameContext();
  const { nextStep } = useChallenge();
  const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });
  const reversedPhrase = "seL simenne tnehcrehc à reppots al etêuq";
  const correctPhrase = "Les ennemis cherchent à stopper la quête";

  useEffect(() => {
    localStorage.setItem(`attempts_${challengeId}`, attempts);
  }, [attempts, challengeId]);

  useEffect(() => {
    localStorage.setItem(`isCompleted_${challengeId}`, isCompleted);
  }, [isCompleted, challengeId]);

  useEffect(() => {
    if (window.DeviceOrientationEvent) {
      setIsDeviceOrientationAvailable(true);
    }
  }, []);

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
        } else {
          alert("La permission d'accès aux capteurs a été refusée");
        }
      } catch (error) {
        console.error('Erreur lors de la demande de permission:', error);
      }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    socket.emit('join_challenge', {
      groupCode: groupCode,
      id: userInfo.id,
      username: userInfo.username,
      profil_picture: userInfo.profil_picture
    });

    socket.on('challenge_attempt', ({ challenge, attempt, success }) => {
      if (challenge === 6) {
        setAttempts(prev => prev + 1);
        setLastInput(attempt);
        deductMoney(4444);

        const message = success ? 'Épreuve réussie !' : 'Mauvaise réponse, réessayez.';
        const type = success ? 'success' : 'error';

        setModal({ isOpen: true, message, type });

        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }
    });

    // Ajout de l'écouteur pour `challenge_success`
    socket.on('challenge_success', ({ challenge }) => {
      if (challenge === 6) {
        // Cette partie est exécutée pour tous les joueurs
        setModal({ isOpen: true, message: 'Épreuve réussie !', type: 'success' });

        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }
    });

    return () => {
      socket.off('challenge_attempt');
      socket.off('challenge_success'); // Nettoyage de l'écouteur
    };
  }, [groupCode, deductMoney, nextStep, userInfo]);

  useEffect(() => {
    const handleOrientation = (event) => {
      const { beta } = event;
      if (beta !== null) {
        let newBlurLevel;
        if (beta <= 58) {
          newBlurLevel = Math.max(0, 10 - (beta / 5.8));
        } else {
          newBlurLevel = Math.min(10, (beta - 58) / 5.8);
        }
        setBlurLevel(newBlurLevel);
      }
    };

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permissionGranted]);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const checkAnswer = () => {
    if (input === correctPhrase) {
      // Lorsqu'un joueur réussit, émettre l'événement `challenge_success` pour tous les joueurs
      socket.emit('challenge_success', { groupCode: groupCode, challenge: 6 });
      setModal({ isOpen: true, message: 'Épreuve réussie !', type: 'success' });

      setTimeout(() => {
        setModal({ isOpen: false, message: '', type: '' });
        nextStep();
      }, 3000);
    } else {
      socket.emit('challenge_attempt', { groupCode: groupCode, challenge: 6, attempt: input, success: input === correctPhrase });
    }
  };

  const challenge = Challenges.find((c) => c.id === 6);

  return (
      <div className="flex flex-col items-center justify-center text-white">
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
        <TransitionModal isOpen={modal.isOpen} message={modal.message} type={modal.type} />



        <p className="mb-8 text-lg" style={{ filter: `blur(${blurLevel}px)` }}>
          {reversedPhrase}
        </p>

        <input
            type="text"
            value={input}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white py-4 px-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-4"
            placeholder="Entrez la phrase correcte"
            disabled={isCompleted}
        />
        <div className="flex items-center gap-2">
          {isDeviceOrientationAvailable && !permissionGranted && (
              <Button
                  onClick={requestPermission}
                  variant="outline"
              >
                Activer les capteurs
              </Button>
          )}

          {!isDeviceOrientationAvailable && (
              <p className="text-yellow-500 mb-4">
                Votre appareil ne supporte pas la détection d'orientation
              </p>
          )}

          <Button
              onClick={checkAnswer}
              className={`${isCompleted || input === '' || input === lastInput ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isCompleted || input === '' || input === lastInput}
          >
            Vérifier la réponse
          </Button>
        </div>
        <p className="mt-4">Nombre d'essais : {attempts}</p>
        {isCompleted && <p className="mt-4 text-green-500">Épreuve réussie !</p>}
      </div>
  );
};

export default Challenge6;
