import { useState, useEffect } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { useChallenge } from '../../contexts/ChallengeContext';
import { socket } from "../../socket.js";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import audioFile1 from '../../assets/audio/Romanens.mp3';
import audioFile2 from '../../assets/audio/Goguey.mp3';
import audioFile3 from '../../assets/audio/Gueraud-Pinet.mp3';
import audioFile4 from '../../assets/audio/Mercier.mp3';

import Challenges from "./challenges.json";
import Title from "../ui/Title.jsx";
import TransitionModal from "../ui/TransitionModal.jsx"; // Ajouter l'importation de TransitionModal

const Challenge11 = () => {
  const { userInfo } = useAuth();
  const { groupCode } = useLobby();
  const challengeId = 11;
  
  const [attempts, setAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem(`attempts_${challengeId}`);
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });

  const [answers, setAnswers] = useState(Array(4).fill(''));
  const [correctAnswers] = useState(['Romanens', 'Goguey', 'Guéraud-Pinet', 'Mercier']);
  const [isCompleted, setIsCompleted] = useState(() => {
    const savedCompleted = localStorage.getItem(`isCompleted_${challengeId}`);
    return savedCompleted ? JSON.parse(savedCompleted) : false;
  });

  const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });

  // Tableau des fichiers audio correspondant à chaque index
  const audioFiles = [audioFile1, audioFile2, audioFile3, audioFile4];

  const { deductMoney } = useGameContext();
  const { nextStep } = useChallenge();
  
  useEffect(() => {
    localStorage.setItem(`attempts_${challengeId}`, attempts);
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem(`isCompleted_${challengeId}`, isCompleted);
  }, [isCompleted]);

  useEffect(() => {
    socket.emit('join_challenge', { groupCode: groupCode, id: userInfo.id, username: userInfo.username, profil_picture: userInfo.profil_picture });
    socket.on('challenge_attempt', ({ challenge, attempt }) => {
      if (challenge === challengeId) {
        setAttempts(prev => prev + 1);
        deductMoney(4444);
        setModal({ isOpen: true, message: "Ce n'est pas la bonne réponse, essayez encore.", type: 'error' });

        // Fermer la pop-up d'erreur après 3 secondes
        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }
    });

    socket.on('challenge_success', ({ player }) => {
      if (player !== userInfo.username) {
        setModal({ isOpen: true, message: `Epreuve réussie !`, type: 'success' });

        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }
    });

    return () => {
      socket.off('challenge_attempt');
      socket.off('challenge_success');
    }
  }, [attempts, deductMoney, groupCode, nextStep, userInfo.id, userInfo.username, userInfo.profil_picture]);

  const handleSelectChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.every((answer, index) => answer === correctAnswers[index])) {
      setIsCompleted(true);
      socket.emit('challenge_success', { groupCode, player: userInfo.username });
      setModal({ isOpen: true, message: 'Épreuve réussie !', type: 'success' });

      // Fermer la pop-up de réussite après 3 secondes
      setTimeout(() => {
        setModal({ isOpen: false, message: '', type: '' });
        nextStep();
      }, 3000); // Le délai de 3 secondes
    } else {
      socket.emit('challenge_attempt', { groupCode, challenge: challengeId, attempt: answers });
    }
  };

  const options = [
    ['Jacquot', 'Goguey', 'Romanens', 'Fouad', 'Rochaix', 'Lestidau', 'Guéraud-Pinet', 'Mercier', 'Viola', 'Cardon', 'Tissier', 'Andréacola'],
    ['Jacquot', 'Goguey', 'Romanens', 'Fouad', 'Rochaix', 'Lestidau', 'Guéraud-Pinet', 'Mercier', 'Viola', 'Cardon', 'Tissier', 'Andréacola'],
    ['Jacquot', 'Goguey', 'Romanens', 'Fouad', 'Rochaix', 'Lestidau', 'Guéraud-Pinet', 'Mercier', 'Viola', 'Cardon', 'Tissier', 'Andréacola'],
    ['Jacquot', 'Goguey', 'Romanens', 'Fouad', 'Rochaix', 'Lestidau', 'Guéraud-Pinet', 'Mercier', 'Viola', 'Cardon', 'Tissier', 'Andréacola'],
  ];

  const allAnswersSelected = answers.every(answer => answer !== '');

  const challenge = Challenges.find((c) => c.id === challengeId);

  return (
    <div className="mt-4 flex flex-col items-center justify-center text-white p-6">
      <Title className="text-primary uppercase">{challenge.title}</Title>
      <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
      {Array(4).fill().map((_, index) => (
          <div key={index} className="mb-4 max-w-md">
          <audio controls className="w-64 mb-3 rounded">
            <source src={audioFiles[index]} type="audio/mpeg" />
            Votre navigateur ne supporte pas l&apos;élément audio.
          </audio>
          <select
            onChange={(e) => handleSelectChange(index, e.target.value)}
            value={answers[index]}
            className="w-full bg-gray-800 text-white py-1 px-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm custom-select"
            disabled={isCompleted}
          >
            <option value="" className="text-sm">Sélectionnez une réponse</option>
            {options[index].map((option, i) => (
              <option key={i} value={option} className="text-sm">{option}</option>
            ))}
          </select>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${!allAnswersSelected || isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!allAnswersSelected || isCompleted}
      >
        Vérifier les réponses
      </button>
      <p className="mt-4">Nombre d&apos;essais : {attempts}</p>
      {isCompleted && <p className="mt-4 text-green-500">Épreuve réussie !</p>}
      
      {/* Modal pour le message de succès ou d'échec */}
      <TransitionModal isOpen={modal.isOpen} message={modal.message} type={modal.type} />
    </div>
  );
};

export default Challenge11;
