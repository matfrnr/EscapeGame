"use client";
import { useState, useEffect, useRef } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
//import { useGameContext} from "../../contexts/GameContext.jsx";
import { useChallenge } from "../../contexts/ChallengeContext.jsx";
import { socket } from "../../socket";
import Challenges from "./challenges.json";
import Scanner from "../ui/Scanner.jsx";
import Title from "../ui/Title.jsx";
import TransitionModal from "../ui/TransitionModal";
import adepteChallengeCard from "../ui/AdepteChallengeCard.jsx";
import AdepteChallengeCard from "../ui/AdepteChallengeCard.jsx";

const Challenge12 = () => {
  const { nextStep, setIsQrCodeScanned } = useChallenge();
  const { groupCode, groupMembers } = useLobby();
  //const { deductMoney } = useGameContext();
  const { userInfo } = useAuth();
  const [word, setWord] = useState("boussole");
  const [guess, setGuess] = useState("");
  const canvasRef = useRef(null);
  const challengeId = 12;
  
  // États existants
  const [isCompleted, setIsCompleted] = useState(() => {
    const savedCompleted = localStorage.getItem(`isCompleted_${challengeId}`);
    return savedCompleted ? JSON.parse(savedCompleted) : false;
  });
  const [attempts, setAttempts] = useState(() => {
    const savedAttempts = localStorage.getItem(`attempts_${challengeId}`);
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });
  const [isAdepte, setIsAdepte] = useState(false);
  const [ifQrCodeScanned, setIfQrCodeScanned] = useState(() => {
    const savedQrScanned = localStorage.getItem(`qrScanned_${challengeId}_${groupCode}`);
    return savedQrScanned ? JSON.parse(savedQrScanned) : false;
  });

  // États pour les modales
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Effet pour fermer automatiquement la modal d'erreur après 3 secondes
  useEffect(() => {
    if (showErrorModal) {
      const timer = setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showErrorModal]);

  // Effet pour la modal de succès et la transition
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        nextStep(); // This will trigger nextStep for all players
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, nextStep]);

  // Effets existants pour localStorage
  useEffect(() => {
    localStorage.setItem(`attempts_${challengeId}`, attempts);
  }, [attempts, challengeId]);

  useEffect(() => {
    localStorage.setItem(`isCompleted_${challengeId}`, isCompleted);
  }, [isCompleted, challengeId]);

  useEffect(() => {
    localStorage.setItem(`qrScanned_${challengeId}_${groupCode}`, JSON.stringify(ifQrCodeScanned));
  }, [ifQrCodeScanned, challengeId, groupCode]);

  // Effet principal pour les sockets et l'initialisation
  useEffect(() => {
    groupMembers.forEach((member) => {
      if (member.adepte === "Tissier") {
        setIsAdepte(member.id === userInfo.id);
      }
    });

    socket.emit("join_challenge", {
      groupCode: groupCode,
      id: userInfo.id,
      username: userInfo.username,
      profil_picture: userInfo.profil_picture
    });

    socket.on("drawing_data", (data) => {
      if (canvasRef.current) {
        canvasRef.current.loadPaths(data);
      }
    });

    socket.on("reset_canvas", () => {
      if (canvasRef.current) {
        canvasRef.current.resetCanvas();
      }
    });

    socket.on("challenge_attempt", ({ attempt }) => {
      setAttempts(prevAttempts => prevAttempts + 1);
      setModalMessage(`Mauvaise réponse : "${attempt}"`);
      setShowErrorModal(true);
      //deductMoney(4444);
    });

    // Gestionnaire pour la modal de succès
    socket.on("challenge_success", (data) => {
      setIsCompleted(true);
      setModalMessage(data.message); // S'assurer que le message est bien reçu du serveur
      setShowSuccessModal(true);
    });
  
    const handleQrCodeScanned = () => {
      setIfQrCodeScanned(true);
      setIsQrCodeScanned(true);
    };

    socket.on("qr_code_scanned", handleQrCodeScanned);

    return () => {
      socket.off("drawing_data");
      socket.off("reset_canvas");
      socket.off("challenge_attempt");
      socket.off("challenge_success");
      socket.off("qr_code_scanned", handleQrCodeScanned);
    };
  }, [isAdepte, groupMembers, userInfo, groupCode, nextStep, setIsQrCodeScanned]);

  function handleQrPermission(data) {
    if (data === "Tissier Pictionary") {
      socket.emit("qr_code_scanned", { groupCode });
      setIfQrCodeScanned(true);
      setIsQrCodeScanned(true);
    } else {
      alert("QR Code invalide");
    }
  }

  const handleDraw = async () => {
    if (canvasRef.current && isAdepte) {
      const drawingData = await canvasRef.current.exportPaths();
      socket.emit("drawing_data", { groupCode, data: drawingData });
    }
  };

  const handleGuessSubmit = () => {
    if (guess.toLowerCase() === word.toLowerCase()) {
      const successMessage = "Bravo ! Le mot a été trouvé !";
      // Émettre l'événement de succès pour tous les joueurs avec le message
      socket.emit("challenge_success", {
        groupCode: groupCode,
        message: successMessage
      });
      setIsCompleted(true);
      setModalMessage(successMessage); // Définir le message avant d'afficher la modal
      setShowSuccessModal(true);
    } else {
      socket.emit("challenge_attempt", {
        groupCode: groupCode,
        challenge: 12,
        attempt: guess
      });
    }
    setGuess("");
  };

  const handleCanvasReset = () => {
    if (isAdepte) {
      socket.emit("reset_canvas", { groupCode });
    }
  };

  const challenge = Challenges.find((c) => c.id === 12);

  if (!ifQrCodeScanned && !isAdepte) {
    return (
      <div>
        <AdepteChallengeCard adepteOf={"Tissier"} />
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight animate-pulse">{challenge.descriptionNonAdepte}</p>
      </div>
    );
  }

  if (!ifQrCodeScanned && isAdepte) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <AdepteChallengeCard adepteOf={"Tissier"} />
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight animate-pulse">{challenge.descriptionAdepte}</p>
        <Scanner className="w-full flex-grow" onSuccess={handleQrPermission} />
      </div>
    );
  }

  return (
    <div className="bg-background p-4 rounded-lg shadow-md">
      <AdepteChallengeCard adepteOf={"Tissier"} />
      <Title className="text-primary uppercase">
        {challenge.title}
      </Title>
      <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>

      {isAdepte ? (
        <div className="text-primary">
          <h3 className="text-xl font-bold mb-4">Mot à dessiner : {word}</h3>
          <ReactSketchCanvas
            ref={canvasRef}
            strokeWidth={4}
            strokeColor="black"
            onStroke={handleDraw}
            canvasWidth="500px"
            canvasHeight="500px"
            className="border border-primary rounded-lg"
          />
          <button
            onClick={handleCanvasReset}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            🧹 Réinitialiser le canvas
          </button>
        </div>
      ) : (
        <div className="text-primary">
          <ReactSketchCanvas
            ref={canvasRef}
            canvasWidth="500px"
            canvasHeight="500px"
            strokeWidth={4}
            strokeColor="black"
            allowOnlyPointerType="none"
            className="border border-primary rounded-lg"
          />
          <div className="mt-4 flex flex-col items-center gap-4">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Devine le mot"
              className="w-full px-4 py-2 border border-primary rounded-lg"
            />
            <button
              onClick={handleGuessSubmit}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Envoyer
            </button>
            <p className="mt-2">Nombre d'essais : {attempts}</p>
            {isCompleted && <p className="text-green-500">Épreuve réussie !</p>}
          </div>
        </div>
      )}

      <TransitionModal 
        isOpen={showErrorModal}
        message={modalMessage}
        type="error"
      />

      <TransitionModal
        isOpen={showSuccessModal}
        message={modalMessage}
        type="success"
      />
    </div>
  );
};

export default Challenge12;