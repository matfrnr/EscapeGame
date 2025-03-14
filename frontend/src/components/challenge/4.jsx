import { useState, useEffect } from 'react';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { useLobby } from '../../contexts/LobbyContext';
import { useAuth } from '../../contexts/AuthContext';
import { useGameContext } from '../../contexts/GameContext';
import { useChallenge } from "../../contexts/ChallengeContext.jsx";
import player1 from "../../assets/images/player1.jpg";
import player2 from '../../assets/images/player2.jpg';
import player3 from '../../assets/images/player3.jpg';
import { socket } from '../../socket';
import Challenges from "./challenges.json";
import Title from "../ui/Title.jsx";
import TransitionModal from "../ui/TransitionModal.jsx";
import Button from "../ui/Button.jsx";

const Challenge4 = () => {
  const { groupCode, groupMembers } = useLobby();
  const { nextStep } = useChallenge();
  const { userInfo } = useAuth();
  const { deductMoney } = useGameContext();
  const [validatedPlayers, setValidatedPlayers] = useState(() => {
    const savedValidatedPlayers = localStorage.getItem(`validatedPlayers_${groupCode}`);
    return savedValidatedPlayers ? JSON.parse(savedValidatedPlayers) : [];
  });
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });
  const [isPositionValidated, setIsPositionValidated] = useState(() => {
    const savedValidated = localStorage.getItem(`validated_${userInfo.id}`);
    return savedValidated ? JSON.parse(savedValidated) : false;
  });
  const position = useGeoLocation();
  const [locationError, setLocationError] = useState('');
  const playerImages = [player1, player2, player3];
  const [distanceToTarget, setDistanceToTarget] = useState(null);
  const targetPositions = [
    { lat: 45.20355613451506, lng: 5.701996388726025 },
    { lat: 45.20355613451506, lng: 5.701996388726025 },
    { lat: 45.20355613451506, lng: 5.701996388726025 },
  ];
  const [attempts, setAttempts] = useState(0);

  const requestLocationPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationError("");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Vous avez refusé la géolocalisation. Activez-la dans les paramètres.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Position non disponible.");
            break;
          case error.TIMEOUT:
            setLocationError("Délai dépassé.");
            break;
          default:
            setLocationError("Erreur inconnue.");
        }
      }
    );
  };

  useEffect(() => {
    localStorage.setItem(`attempts_challenge4_${userInfo.id}`, attempts);
  }, [attempts, userInfo.id]);

  useEffect(() => {
    localStorage.setItem(`validated_${userInfo.id}`, JSON.stringify(isPositionValidated));
  }, [isPositionValidated, userInfo.id]);

  useEffect(() => {
    position.getLocation();

    const interval = setInterval(() => {
      position.getLocation();
    }, 1000);

    if (groupCode) {
      socket.emit('join_challenge', {
        groupCode,
        id: userInfo.id,
        username: userInfo.username,
        profil_picture: userInfo.profil_picture
      });
    }

    socket.on('attempts_updated', ({ attempts: newAttempts }) => {
      setAttempts(newAttempts);
    });

    socket.on('position_validated', (data) => {
      setValidatedPlayers(data.validatedPlayers);
      localStorage.setItem(`validatedPlayers_${groupCode}`, JSON.stringify(data.validatedPlayers));

      if (data.validatedPlayers.some(player => player.id === userInfo.id)) {
        setIsPositionValidated(true);
        setMessage('Position validée !');
        setModal({ isOpen: true, message: 'Position validée !', type: 'success' });

        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }

      if (data.validatedPlayers.length === groupMembers.length) {
        setModal({ isOpen: true, message: 'Épreuve réussie !', type: 'success' });

        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
          nextStep();
        }, 3000);
      }
    });

    return () => {
      clearInterval(interval);
      socket.off('position_validated');
      socket.off('attempts_updated');
    };
  }, [groupCode, userInfo, position, deductMoney, nextStep, groupMembers.length]);

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const checkPosition = () => {
    if (isPositionValidated) {
      setMessage('Vous avez déjà validé votre position.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!position.latitude || !position.longitude) {
      setMessage('Position non disponible. Activation du GPS...');
      position.getLocation();
      return;
    }

    const playerIndex = groupMembers.findIndex(member => member.id === userInfo.id);
    const targetPosition = targetPositions[playerIndex];

    const distance = getDistanceFromLatLonInMeters(
      position.latitude,
      position.longitude,
      targetPosition.lat,
      targetPosition.lng
    );

    setDistanceToTarget(Math.round(distance));

    const success = distance <= 20;

    if (!success) {
      // Gestion locale de l'erreur
      setAttempts(prev => prev + 1);
      setModal({ 
        isOpen: true, 
        message: `Position incorrecte - Distance : ${Math.round(distance)}m`, 
        type: 'error' 
      });
      deductMoney(4444);

      // Fermer la modal après 3 secondes
      setTimeout(() => {
        setModal({ isOpen: false, message: '', type: '' });
      }, 3000);
    }

    // Envoyer la tentative au serveur (uniquement pour le tracking)
    socket.emit('challenge_attempt', {
      groupCode,
      challenge: 4,
      attempt: {
        position: {
          lat: position.latitude,
          lng: position.longitude
        },
        targetPosition: targetPosition,
        playerName: userInfo.username
      },
      success,
      playerId: userInfo.id
    });

    if (success) {
      socket.emit('position_validated', {
        groupCode,
        playerId: userInfo.id,
        playerName: userInfo.username
      });
    }
  };

  const challenge = Challenges.find((c) => c.id === 4);

  return (
      <div className="p-4">
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
        <TransitionModal isOpen={modal.isOpen} message={modal.message} type={modal.type}/>

        <img
            src={playerImages[groupMembers.findIndex(member => member.id === userInfo.id)]}
            alt="Destination"
            className="w-full max-w-md mx-auto rounded-lg shadow-lg mb-6"
        />
          <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <Button
              onClick={requestLocationPermission}
              variant="outline"
          >
            Activer la localisation
          </Button>
        </div>

        {!isPositionValidated && (
            <Button
                onClick={checkPosition}

            >
              Valider ma position
            </Button>
        )}
        </div>

        {locationError && (
            <p className="text-red-500 text-sm text-center mt-2">
              {locationError}
            </p>
        )}

        {message && (
            <div className="mt-4 p-3 rounded text-center bg-primary/20 text-primary">
              {message}
            </div>
        )}

        <div className="mt-4 text-center text-lg font-bold">
          {distanceToTarget !== null && (
              <p>Distance actuelle : {distanceToTarget} mètres</p>
          )}
        </div>

        <div className="mt-4 text-center">
          <p>Nombre d&apos;essais : {attempts}</p>
        </div>

        <div className="mt-4">
          <p className="text-center mb-4">{validatedPlayers.length}/{groupMembers.length}</p>
          <div className="flex justify-center items-center space-x-4 mt-2">
            {groupMembers.map((member, index) => (
                <div key={member.id} className="flex flex-col items-center">
                  <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center ${validatedPlayers.some(player => player.id === member.id)
                          ? 'bg-green-500'
                          : 'bg-neutral-700'
                      }`}>
                    <img
                        src={playerImages[index]}
                        alt={`Player ${index + 1}`}
                        className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <p className="text-white mt-2">{member.username}</p>
                </div>
            ))}
          </div>
        </div>

      </div>
  );
};

export default Challenge4;