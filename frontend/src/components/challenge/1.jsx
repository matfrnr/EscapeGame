import { useState, useEffect } from "react";
import Scanner from "../ui/Scanner";
import { socket } from "../../socket";
import QRProgress from "../ui/QRProgress";
import { useChallenge } from "../../contexts/ChallengeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLobby } from "../../contexts/LobbyContext";
import Challenges from "./challenges.json";
import TransitionModal from "../ui/TransitionModal";
import Title from "../ui/Title.jsx";

const Challenge1 = () => {
  const { userInfo } = useAuth();
  const { groupCode } = useLobby();
  const { nextStep } = useChallenge();

  const [qrCodes, setQrCodes] = useState(() => {
    const savedQrCodes = localStorage.getItem('scannedQrCodes');
    return savedQrCodes ? JSON.parse(savedQrCodes) : [];
  });
  const [isCompleted, setIsCompleted] = useState(() => {
    const savedCompleted = localStorage.getItem('isCompletedQR');
    return savedCompleted ? JSON.parse(savedCompleted) : false;
  });
  const [message, setMessage] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [lastScanTime, setLastScanTime] = useState(0);
  const [attempts, setAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem('attemptsQR');
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });
  const [resetScanner, setResetScanner] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showQrSuccessModal, setShowQrSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validQrCodes = ["code1", "code2", "code3", "code4", "code5"];

  useEffect(() => {
    localStorage.setItem('attemptsQR', attempts);
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('scannedQrCodes', JSON.stringify(qrCodes));

    if (qrCodes.length === 5 && !isCompleted) {
      setIsCompleted(true);
      setMessage("Bravo ! Vous avez trouvé tous les QR codes !");
      setShowSuccessModal(true);
      socket.emit('challenge_success', {
        groupCode,
        challenge: 1,
      });
      
      setTimeout(() => {
        nextStep();
      }, 3000);
    }
  }, [qrCodes, groupCode, nextStep]);

  useEffect(() => {
    localStorage.setItem('isCompletedQR', isCompleted);
  }, [isCompleted]);

  useEffect(() => {
    socket.emit('join_challenge', {
      groupCode,
      id: userInfo.id,
      username: userInfo.username,
      profil_picture: userInfo.profil_picture
    });

    socket.on('challenge_attempt', ({ challenge, attempt }) => {
      if (challenge === 1) {
        const currentTime = Date.now();
        if (attempt.code === lastScannedCode && currentTime - lastScanTime < 3000) {
          return;
        }

        setAttempts(prev => prev + 1);
        setLastScanTime(currentTime);

        if (!validQrCodes.includes(attempt.code)) {
          setMessage("QR code incorrect. Veuillez essayer un autre QR code.");
          setShowErrorModal(true);
        } else if (qrCodes.includes(attempt.code)) {
          setMessage("QR code déjà scanné. Veuillez essayer un autre QR code.");
          setShowErrorModal(true);
        } else {
          const newQrCodes = [...qrCodes, attempt.code];
          setQrCodes(newQrCodes);
          setLastScannedCode(attempt.code);
          
          // Afficher la popup de succès pour un QR code validé
          setSuccessMessage(`QR code ${newQrCodes.length}/5 validé !`);
          setShowQrSuccessModal(true);
          
          // Émettre l'événement de succès pour un QR code
          socket.emit('qr_success', {
            groupCode,
            challenge: 1,
            qrCount: newQrCodes.length
          });
          
          // Fermer la popup après 2 secondes
          setTimeout(() => {
            setShowQrSuccessModal(false);
          }, 2000);
        }

        setResetScanner(true);
        setTimeout(() => {
          setResetScanner(false);
          setMessage("");
          setShowErrorModal(false);
        }, 2000);
      }
    });

    // Écouter l'événement de succès final
    socket.on('challenge_success', ({ challenge }) => {
      if (challenge === 1) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 5000);
      }
    });

    // Écouter l'événement de succès d'un QR code
    socket.on('qr_success', ({ challenge, qrCount }) => {
      if (challenge === 1) {
        setSuccessMessage(`QR code ${qrCount}/5 validé !`);
        setShowQrSuccessModal(true);
        setTimeout(() => {
          setShowQrSuccessModal(false);
        }, 2000);
      }
    });

    return () => {
      socket.off('challenge_attempt');
      socket.off('challenge_success');
      socket.off('qr_success');
    };
  }, [attempts, groupCode, nextStep, qrCodes, lastScannedCode, lastScanTime, userInfo]);

  const handleScan = (data) => {
    if (data && !isCompleted && !resetScanner) {
      const currentTime = Date.now();
      if (data === lastScannedCode && currentTime - lastScanTime < 3000) {
        return;
      }

      socket.emit('challenge_attempt', {
        groupCode: groupCode,
        challenge: 1,
        attempt: { code: data }
      });
    }
  };

  const challenge = Challenges.find((c) => c.id === 1);

  return (
    <div className=" flex flex-col items-center justify-center text-white mb-10">
      <Title className="text-primary uppercase">
        {challenge.title}
      </Title>
      <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
      {!isCompleted && !resetScanner && <Scanner onSuccess={handleScan} />}
      <QRProgress length={5} current={qrCodes.length} />
      <div className="mt-4 text-center">
        <p>Nombre d&apos;essais : {attempts}</p>
      </div>
      {message && (
        <div className={`mt-4 p-3 rounded text-center ${isCompleted ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {message}
        </div>
      )}
      {isCompleted && <p className="mt-4 text-green-500">Épreuve réussie !</p>}
      
      {/* Modal d'erreur */}
      <TransitionModal
        isOpen={showErrorModal}
        message={message}
        type="error"
      />
      
      {/* Modal de succès final */}
      <TransitionModal
        isOpen={showSuccessModal}
        message="Bravo ! Vous avez réussi le challenge !"
        type="success"
      />

      {/* Modal de succès pour chaque QR code */}
      <TransitionModal
        isOpen={showQrSuccessModal}
        message={successMessage}
        type="success"
      />
    </div>
  );
};

export default Challenge1;