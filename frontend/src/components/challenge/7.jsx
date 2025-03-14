import { useEffect, useState } from "react";
import MorseAudio from "../../assets/audio/traitre_morse_audio.wav";
import Scanner from "../ui/Scanner.jsx";
import Button from "../ui/Button.jsx";
import useSpeechRecognition from "../../hooks/useSpeechRecognition.js";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChallenge } from "../../contexts/ChallengeContext.jsx";
import { socket } from "../../socket.js";
import Title from "../ui/Title.jsx";
import Challenges from "./challenges.json"
import TransitionModal from "../ui/TransitionModal";
import adepteChallengeCard from "../ui/AdepteChallengeCard.jsx";
import AdepteChallengeCard from "../ui/AdepteChallengeCard.jsx";

const morseEquivalences = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  1: ".----",
  2: "..---",
  3: "...--",
  4: "....-",
  5: ".....",
  6: "-....",
  7: "--...",
  8: "---..",
  9: "----.",
  0: "-----",
  ",": ".-.-.-",
  ".": ".-.-.-",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  "*espace*": "/",
};

export default function Challenge7() {
  const { nextStep, isQrCodeScanned, setIsQrCodeScanned } = useChallenge();
  const [isAdepte, setIsAdepte] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    correctedText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    permissionError,
  } = useSpeechRecognition();
  const expectedMessage = "traitre";

  const { groupMembers, groupCode } = useLobby();
  const { userInfo } = useAuth();

  // Gestionnaire pour fermer la modale d'erreur après 3 secondes
  useEffect(() => {
    let timer;
    if (showErrorModal) {
      timer = setTimeout(() => {
        setShowErrorModal(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showErrorModal]);

  // Gestionnaire pour la modale de succès
  useEffect(() => {
    let timer;
    if (showSuccessModal) {
      timer = setTimeout(() => {
        setShowSuccessModal(false);
        nextStep();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessModal, nextStep]);

  useEffect(() => {
    groupMembers.forEach((member) => {
      if (member.adepte === "Guéraud-Pinet") {
        setIsAdepte(member.id === userInfo.id);
      }
    });

    socket.emit("join_challenge", {
      groupCode: groupCode,
      id: userInfo.id,
      username: userInfo.username,
      profil_picture: userInfo.profil_picture,
    });

    socket.on("challenge_attempt", ({ challenge, attempt }) => {
      if (challenge === 7) {
        setFeedback("❌ Le message n'est pas correct. Essayez encore !");
        // Supprimez setShowErrorModal(true)
      }
    });

    socket.on("show_error_modal", () => {
      setShowErrorModal(true);
    });

    socket.on("show_success_modal", () => {
      setShowSuccessModal(true);
    });

    return () => {
      socket.off("challenge_attempt");
      socket.off("show_error_modal");
      socket.off("show_success_modal");
    };
  }, [groupCode, groupMembers, userInfo]);

  function handleQrPermission(data) {
    if (data === "Geraud Pinet Morse") {
      socket.emit("qr_code_scanned", { groupCode });
      setIsQrCodeScanned(true);
      setIsQrCodeScanned(true);
    } else {
      alert("QR Code invalide");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim().toLowerCase() === expectedMessage.toLowerCase()) {
      setFeedback("✅ Bravo, le message est correct !");
      // Émettre l'événement de succès avant d'afficher la modale
      socket.emit("success_challenge", { groupCode });
      // Afficher la modale de succès pour tous les joueurs, y compris l'adepte
      setShowSuccessModal(true);
    } else {
      socket.emit("challenge_attempt", {
        groupCode: groupCode,
        challenge: 7,
        attempt: userInput,
      });
      socket.emit("error_challenge", { groupCode });
    }
  };

  useEffect(() => {
    if (correctedText) {
      setUserInput(correctedText);
    }
  }, [correctedText]);

  const challenge = Challenges.find((c) => c.id === 7);
  if (!isQrCodeScanned && !isAdepte) {
    return (
      <div>
        <AdepteChallengeCard adepteOf={"Guéraud-Pinet"} />
        <Title className="text-primary uppercase">{challenge.title}</Title>

        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">
          {challenge.descriptionNonAdepte}
        </p>
      </div>
    );
  }

  if (!isQrCodeScanned && isAdepte) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <AdepteChallengeCard adepteOf={"Guéraud-Pinet"} />
        <Title className="text-primary uppercase">{challenge.title}</Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">
          {challenge.descriptionAdepte}
        </p>
        <Scanner className="w-full flex-grow" onSuccess={handleQrPermission} />
      </div>
    );
  }

  if (isAdepte) {
    return (
      <div className="space-y-4 rounded-lg bg-neutral-700 p-4 font-mono text-white shadow-md">
        <AdepteChallengeCard adepteOf={"Guéraud-Pinet"} />
        <Title>{challenge.title}</Title>
        <p className="mb-10 text-center">{challenge.description}</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(morseEquivalences).map(([letter, morse]) => (
            <div
              key={letter}
              className="flex justify-between rounded-md bg-neutral-600 p-2 text-sm"
            >
              <span className="font-bold">{letter}</span>
              <span className="font-mono">{morse}</span>
            </div>
          ))}
        </div>
        <TransitionModal
          isOpen={showErrorModal}
          message="Mauvaise réponse ! Essayez encore."
          type="error"
        />
        <TransitionModal
          isOpen={showSuccessModal}
          message="Bravo ! Réunissinez-vous avec votre équipe pour continuer."
          type="success"
        />
      </div>
    );
  }

  return (
    <>
      <AdepteChallengeCard adepteOf={"Guéraud-Pinet"} />
      <div className="space-y-4">
        <div className="space-y-4 rounded-lg bg-neutral-700 p-4">
          <h3 className="text-lg font-bold">
            Écoutez le fichier audio et entrez le code Morse
          </h3>
          <audio controls className="w-full">
            <source src={MorseAudio} type="audio/mpeg" />
            Votre navigateur ne supporte pas les audios.
          </audio>
        </div>
        <TransitionModal
          isOpen={showErrorModal}
          message="Mauvaise réponse ! Essayez encore."
          type="error"
        />
        <TransitionModal
          isOpen={showSuccessModal}
          message="Bravo ! Réunissinez-vous avec votre équipe pour continuer."
          type="success"
        />
        <div className="space-y-4 rounded-lg bg-neutral-700 p-4">
          <h3 className="text-lg font-bold">
            Entrez le message décrypté ou utilisez la reconnaissance vocale
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Entrez le message ici"
              className="w-full rounded-md border border-neutral-500 bg-neutral-600 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {hasRecognitionSupport ? (
              <>
                <div>
                  {permissionError && (
                    <p className="mb-2 text-red-500">{permissionError}</p>
                  )}
                  {!isListening ? (
                    <Button
                      onClick={startListening}
                      className="w-full"
                      variant="outline"
                    >
                      🎤 Commencer à parler
                    </Button>
                  ) : (
                    <Button
                      onClick={stopListening}
                      className="w-full"
                      variant="secoundary"
                    >
                      🛑 Arrêter
                    </Button>
                  )}
                </div>
                {isListening && <p>🎙️ Enregistrement en cours...</p>}
              </>
            ) : (
              <p>
                La reconnaissance vocale n&apos;est pas supportée par votre
                navigateur.
              </p>
            )}
            <Button type="submit" className="w-full">
              Valider
            </Button>
          </form>
          {feedback && (
            <div className="mt-4 rounded-md bg-neutral-800 p-3">
              <p>{feedback}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
