import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useGameContext } from "../../contexts/GameContext";
import { useChallenge } from "../../contexts/ChallengeContext";
import { socket } from "../../socket.js";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Challenges from "./challenges.json";
import Title from "../ui/Title.jsx";
import TransitionModal from "../ui/TransitionModal.jsx";
import { ChevronDown } from "lucide-react"
import Button from "../ui/Button.jsx";

const InteractiveChessboard = () => {
  const { userInfo } = useAuth();
  const { groupCode } = useLobby();
  const { deductMoney } = useGameContext();
  const { nextStep } = useChallenge();

  const initialPosition = '1r3b2/2nR4/2pNn1kp/1p2PN2/6P1/7P/r7/2B1R1K1 w - - 0 1';
  const expectedMove = { from: 'f5', to: 'h4' };

  const [game, setGame] = useState(new Chess(initialPosition));
  const [message, setMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [attempts, setAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem('attemptsChess');
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });

  const [isCompleted, setIsCompleted] = useState(() => {
    const savedCompleted = localStorage.getItem('isCompletedChess');
    return savedCompleted ? JSON.parse(savedCompleted) : false;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, message: '', type: '' });

  useEffect(() => {
    localStorage.setItem('attemptsChess', attempts);
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('isCompletedChess', isCompleted);
  }, [isCompleted]);

  useEffect(() => {
    socket.emit('join_challenge', { groupCode, id: userInfo.id, username: userInfo.username, profil_picture: userInfo.profil_picture });

    socket.on('challenge_attempt', ({ challenge, attempt }) => {
      if (challenge === 3) {
        setAttempts(prev => prev + 1);
        setMessage("Ce n'est pas le bon coup, essayez encore.");
        setIsCorrect(false);
        deductMoney(4444);
        setModal({ isOpen: true, message: "Ce n'est pas le bon coup, essayez encore.", type: 'error' });

        // Fermer la pop-up d'erreur après 3 secondes
        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }
    });

    // Écouter l'événement `challenge_success` pour afficher la pop-up pour tous les joueurs
    socket.on('challenge_success', ({ player }) => {
      if (player !== userInfo.username) {
        setModal({ isOpen: true, message: `Epreuve réussi !`, type: 'success' });

        setTimeout(() => {
          setModal({ isOpen: false, message: '', type: '' });
        }, 3000);
      }
    });

    return () => {
      socket.off('challenge_attempt');
      socket.off('challenge_success');
    };
  }, [attempts, deductMoney, groupCode,nextStep, userInfo.id, userInfo.profil_picture, userInfo.username]);

  function onDrop(sourceSquare, targetSquare) {
    if (isCompleted) return false;

    if (sourceSquare === expectedMove.from && targetSquare === expectedMove.to) {
      // Emission de l'événement `challenge_success` pour tous les joueurs
      socket.emit('challenge_success', { groupCode, player: userInfo.username });

      setModal({ isOpen: true, message: 'Épreuve réussie !', type: 'success' });

      // Fermer la pop-up de réussite après 3 secondes
      setTimeout(() => {
        setModal({ isOpen: false, message: '', type: '' });
        nextStep();
      }, 3000); // Le délai de 3 secondes
    } else {
      socket.emit('challenge_attempt', { groupCode: groupCode, challenge: 3, attempt: { from: sourceSquare, to: targetSquare } });
    }
    return true;
  }

  const challenge = Challenges.find((c) => c.id === 3);

  return (
    <div className="max-w-2xl mx-auto">
      <Title className="text-primary uppercase">
        {challenge.title}
      </Title>
      <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
      <Button onClick={() => setIsModalOpen(true)}  className="w-full mb-2" variant="secoundary">
        Comment déplacer les pièces ?
      </Button>
      <div className="mb-2">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          draggable={!isCompleted}
        />
      </div>
      <div className="text-center">
        <p>Nombre d&apos;essais : {attempts}</p>
        {isCompleted && <p className="mt-4 text-green-500">Épreuve réussie !</p>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-white">Déplacement des pièces</h2>
            <ul className="space-y-2 text-white">
              <li>Roi : se déplace d'une case dans n'importe quelle direction.</li>
              <li>Reine : se déplace en ligne droite horizontalement, verticalement ou en diagonale.</li>
              <li>Tour : se déplace en ligne droite horizontalement ou verticalement.</li>
              <li>Fou : se déplace en diagonale.</li>
              <li>Cavalier : se déplace en forme de "L".</li>
              <li>Pion : se déplace d'une case vers l'avant, capture en diagonale.</li>
            </ul>
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="mt-4 p-2 bg-red-500 text-white rounded w-full"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal pour le message de succès ou d'échec */}
      <TransitionModal isOpen={modal.isOpen} message={modal.message} type={modal.type} />
    </div>
  );
};

export default InteractiveChessboard;
