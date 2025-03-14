import  { useState, useEffect } from 'react';
import { socket } from '../../socket'; // Assurez-vous que le chemin est correct
import { useLobby } from '../../contexts/LobbyContext'; // Importer le hook useLobby
import { useAuth } from '../../contexts/AuthContext'; // Importer le hook useAuth
import { useGameContext } from '../../contexts/GameContext';
import { useChallenge } from '../../contexts/ChallengeContext';
import Challenges from "./challenges.json"
import Title from "../ui/Title.jsx";

const questions = [
    {
        questionText: `Quel est le système d'exploitation préféré de M Jacquot?`,
        answerOptions: [
            { answerText: 'Windows', isCorrect: false },
            { answerText: 'MacOS', isCorrect: false },
            { answerText: 'Linux', isCorrect: true },
            { answerText: 'Unix', isCorrect: false },
        ],
    },
    {
        questionText: 'Qui dit "vous suivez" ?',
        answerOptions: [
            { answerText: 'Fouad', isCorrect: true },
            { answerText: 'Cardon', isCorrect: false },
            { answerText: 'Tissier', isCorrect: true },
            { answerText: 'Andreacola', isCorrect: false },
        ],
    },
    {
        questionText: `Quel BDE s'était endetté à hauteur de 4 500 euros ?`,
        answerOptions: [
            { answerText: 'BDE Commico', isCorrect: true },
            { answerText: 'BDE Cosmos', isCorrect: false },
            { answerText: 'BDE MMI', isCorrect: false },
            { answerText: 'BDE GREMMI', isCorrect: false },
        ],
    },
    {
        questionText: 'Quel est le prof qui à inventé la pause de rien ?',
        answerOptions: [
            { answerText: 'Fouad', isCorrect: false },
            { answerText: 'Romanens', isCorrect: false },
            { answerText: 'Tissier', isCorrect: false },
            { answerText: 'Cardon', isCorrect: true },
        ],
    },
    {
        questionText: `Quel était l'ancienne adresse de l'iut`,
        answerOptions: [
            { answerText: '7 esplanade andry farcy', isCorrect: false },
            { answerText: '17 quai claude bernard', isCorrect: true },
            { answerText: '3 avenue des martyrs', isCorrect: false },
            { answerText: '29 rue Pierre semard', isCorrect: false },
        ],
    },
    {
        questionText: 'Quel est le plus grand océan du monde ?',
        answerOptions: [
            { answerText: 'Océan Atlantique', isCorrect: false },
            { answerText: 'Océan Pacifique', isCorrect: true },
            { answerText: 'Océan Indien', isCorrect: false },
            { answerText: 'Océan Arctique', isCorrect: false },
        ],
    },

    {
        questionText: 'Quel est le plus grands pays en superficie ?',
        answerOptions: [
            { answerText: 'Canada', isCorrect: false },
            { answerText: 'Chine', isCorrect: false },
            { answerText: 'Russie', isCorrect: true },
            { answerText: 'USA', isCorrect: false },
        ],
    },
    {
        questionText: 'Quel est le symbole chimique de l\'or ?',
        answerOptions: [
            { answerText: 'Au', isCorrect: true },
            { answerText: 'Ag', isCorrect: false },
            { answerText: 'Fe', isCorrect: false },
            { answerText: 'O', isCorrect: false },
        ],
    },
    {
        questionText: 'Quelle est la vitesse de la lumière ?',
        answerOptions: [
            { answerText: '300 000 km/s', isCorrect: true },
            { answerText: '150 000 km/s', isCorrect: false },
            { answerText: '450 000 km/s', isCorrect: false },
            { answerText: '600 000 km/s', isCorrect: false },
        ],
    },
    {
        questionText: `Quelle est la seule particule élémentaire parmi les suivantes qui n'est pas composée de quarks ?`,
        answerOptions: [
            { answerText: 'Proton', isCorrect: false },
            { answerText: 'Neutron', isCorrect: false },
            { answerText: 'Electron', isCorrect: true },
            { answerText: 'Pion', isCorrect: false },
        ],
    },
];

const Quiz = () => {
    const { groupCode, groupMembers } = useLobby();
    const { userInfo } = useAuth();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const { deductMoney } = useGameContext();
    const { nextStep } = useChallenge();
    const isLeader = groupMembers.some(member => member.id === userInfo.id && member.role === 1);

    useEffect(() => {
        const savedProgress = JSON.parse(localStorage.getItem('quizProgress'));
        if (savedProgress) {
            setCurrentQuestion(savedProgress.currentQuestion);
            setScore(savedProgress.score);
        }

        socket.emit('join_challenge', { groupCode, id: userInfo.id, username: userInfo.username, profil_picture: userInfo.profil_picture });

        socket.on('question_answered', ({ questionIndex, isCorrect }) => {
            if (isCorrect && !isLeader) {
                setScore(prevScore => prevScore + 1);
            }
            setCurrentQuestion(questionIndex);
            if (questionIndex >= questions.length) {
                setShowScore(true);
            }
        });

        return () => {
            socket.off('question_answered');
        };
    }, [groupCode]);

    const handleAnswerOptionClick = (isCorrect) => {
        // Vérifie si la réponse est correcte ou non
        if (isCorrect) {
          setScore(score + 1);
        } else {
            deductMoney(4444);
        }

        // Passe à la question suivante
        const nextQuestion = currentQuestion + 1;
        socket.emit('question_answered', {
          groupCode,
          questionIndex: nextQuestion,
          isCorrect,
        });

        // Sauvegarde l'état de progression dans localStorage
        localStorage.setItem('quizProgress', JSON.stringify({
          currentQuestion: nextQuestion,
          score: isCorrect ? score + 1 : score,
        }));

        if (nextQuestion >= questions.length) {
          setShowScore(true);
          localStorage.removeItem('quizProgress');
        } else {
          setCurrentQuestion(nextQuestion); // Passe immédiatement à la question suivante sans délai
        }
      };


    const handleNextStep = () => {
        nextStep(); // Passer à l'épreuve suivante après avoir cliqué sur "Suivant"
    };

    const challenge = Challenges.find((c) => c.id === 8);

    return (
      <div className="p-4">
          <Title className="text-primary uppercase">
              {challenge.title}
          </Title>
          <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
          {showScore ? (
            <div className="text-2xl font-bold text-center mb-8">
                Vous avez obtenu {score} sur {questions.length}
                <div className="mt-4">
                    <button
                      onClick={handleNextStep}
                      className="px-4 py-2 bg-primary text-white rounded-lg"
                    >
                        Suivant
                    </button>
                </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl p-6 rounded-lg shadow-md mx-auto">
                <div className="mb-8 text-xl font-semibold text-center">
                    {questions[currentQuestion].questionText}
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {questions[currentQuestion].answerOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerOptionClick(option.isCorrect)}
                        className={`p-4 rounded-lg ${!isLeader ? 'bg-gray-500 cursor-not-allowed' : 'bg-primary text-white'}`}
                        disabled={!isLeader}
                      >
                          {option.answerText}
                      </button>
                    ))}
                </div>
            </div>
          )}
          <footer className='text-center mt-12'>
              <p className='text-xs'>Seul le chef d&apos;équipe peut répondre</p>
          </footer>
      </div>
    );
};

export default Quiz;