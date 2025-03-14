import {useEffect, useRef, useState} from "react";
import TeamImage1 from "../../assets/images/Image1.jpg";
import Image1Hint1 from "../../assets/images/Image1_hint1.jpg";
import Image1Hint2 from "../../assets/images/Image1_hint2.jpg";
import Image1Hint3 from "../../assets/images/Image1_hint3.jpg";
import AdepteImage1 from "../../assets/images/Image1_target.jpg";
import { cn } from "../../utils/utils";
import Button from "../ui/Button";
import AdepteChallengeCard from "../ui/AdepteChallengeCard";
import Scanner from "../ui/Scanner";
import { useGameContext } from "../../contexts/GameContext.jsx";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChallenge } from "../../contexts/ChallengeContext.jsx"
import Title from "../ui/Title.jsx";
import { socket } from "../../socket.js";
import Challenges from "./challenges.json";
import TransitionModal from "../ui/TransitionModal";
import adepteChallengeCard from "../ui/AdepteChallengeCard";

function ChallengePaint() {
  const [isAdepte, setIsAdepte] = useState(false);
  const [selectedPaint, setSelectedPaint] = useState(null);
  const image1 = [TeamImage1, Image1Hint1, Image1Hint2, Image1Hint3];
  const correctPaint = 9;
  const scannerRef = useRef(null);

  const { usedHints, deductMoney } = useGameContext();

  const { nextStep, isQrCodeScanned, setIsQrCodeScanned } = useChallenge();
  const { groupMembers, groupCode } = useLobby();
  const { userInfo } = useAuth();

  // États pour les modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    groupMembers.forEach((member) => {
      if (member.adepte === "Tissier") {
        setIsAdepte(member.id === userInfo.id);
      }
    });
  }, [groupMembers, userInfo.id]);

    useEffect(() => {
        if (!isQrCodeScanned && isAdepte && !scannerRef.current) {
            scannerRef.current = <Scanner className="w-full flex-grow" onSuccess={handleQrPermission} />;
        }
    }, [isQrCodeScanned, isAdepte]);

  function handleQrPermission(data) {
    if (data === "Tissier Différence") {
      socket.emit("qr_code_scanned", { groupCode });
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setIsQrCodeScanned(true);
      }, 3000);
    } else {
      setErrorMessage("QR Code invalide");
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    }
  }

  useEffect(() => {
    socket.emit("join_challenge", {
      groupCode: groupCode,
      id: userInfo.id,
      username: userInfo.username,
      profil_picture: userInfo.profil_picture,
    });

    const handleQrCodeScanned = () => {
      setIsQrCodeScanned(true);
    };

    const handleChallengeSuccess = () => {
      setShowCompletionModal(true);
      setTimeout(() => {
        setShowCompletionModal(false);
        nextStep();
      }, 5000);
    };

    socket.on("qr_code_scanned", handleQrCodeScanned);
    socket.on("challenge_attempt", ({ challenge, attempt }) => {
      if (challenge === 5) {
        setErrorMessage("Mauvais tableau !");
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 3000);
        deductMoney(4444);
      }
    });

    socket.on("challenge_success", handleChallengeSuccess);

    return () => {
      socket.off("qr_code_scanned", handleQrCodeScanned);
      socket.off("challenge_attempt");
      socket.off("challenge_success", handleChallengeSuccess);
    };
  }, [deductMoney, groupCode, setIsQrCodeScanned, userInfo, nextStep]);

  const getImage = () => {
    if (usedHints.includes("challenge5-hint3")) return image1[3];
    if (usedHints.includes("challenge5-hint2")) return image1[2];
    if (usedHints.includes("challenge5-hint1")) return image1[1];
    return image1[0];
  };

  const OnSubmit = (event) => {
    event.preventDefault();
    if (selectedPaint === correctPaint) {
      // Émettre l'événement de réussite pour tout le groupe
      socket.emit("challenge_success", {
        groupCode: groupCode,
        challenge: 5
      });
    } else {
      socket.emit("challenge_attempt", {
        groupCode: groupCode,
        challenge: 5,
        attempt: selectedPaint,
      });
    }
  };

  const challenge = Challenges.find((c) => c.id === 5);

  if (!isQrCodeScanned && !isAdepte) {
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

  if (!isQrCodeScanned && isAdepte) {
    return (
      <div className="space-y-4 flex items-center flex-col justify-center">
        <AdepteChallengeCard adepteOf={"Tissier"} />
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight animate-pulse">{challenge.descriptionAdepte}</p>
          {scannerRef.current}
        <TransitionModal
          isOpen={showErrorModal}
          message={errorMessage}
          type="error"
        />
      </div>
    );
  }

  if (isAdepte) {
    return (
      <div className="space-y-4">
        <AdepteChallengeCard adepteOf={"Tissier"} />
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>

        <img src={AdepteImage1} alt="bonne chance mon reuf" />
        
        <TransitionModal
          isOpen={showCompletionModal}
          message="Félicitations ! Réunissinez-vous avec votre équipe pour continuer."
          type="success"
        />
        <TransitionModal
          isOpen={showErrorModal}
          message={errorMessage}
          type="error"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdepteChallengeCard adepteOf={"Tissier"} />
      <h3 className="bg-neutral-700 p-3 rounded-lg font-sans tracking-tight text-sm">
        <span className="pr-3">🔎</span>Trouve quel tableau a ton adepte d&apos;après sa description
      </h3>
      <img
        src={getImage()}
        alt="Tableau"
        className="w-full rounded-md object-cover"
      />
      <form onSubmit={OnSubmit} className="space-y-4">
        <h3 className="bg-neutral-700 p-3 rounded-lg font-sans tracking-tight text-sm">
          <span className="pr-3">🎨</span>Choisis le tableau
        </h3>
        <div className="grid grid-cols-6 gap-1 auto-rows-min">
          {[...Array(12)].map((_, index) => (
            <input
              key={index}
              type="radio"
              name="paint"
              id={`paint-${index + 1}`}
              className="hidden"
              onChange={() => setSelectedPaint(index + 1)}
            />
          ))}
          {[...Array(12)].map((_, index) => (
            <label
              key={index}
              htmlFor={`paint-${index + 1}`}
              className={cn(
                "flex items-center justify-center bg-neutral-700 rounded-md cursor-pointer",
                selectedPaint === index + 1 && "bg-primary text-white"
              )}
              style={{
                minWidth: "4rem",
                minHeight: "4rem",
              }}
            >
              {index + 1}
            </label>
          ))}
        </div>
        <Button className="w-full">Valider</Button>
      </form>

      <TransitionModal
        isOpen={showCompletionModal}
        message="Félicitations ! Réunissinez-vous avec votre équipe pour continuer."
        type="success"
      />
      <TransitionModal
        isOpen={showErrorModal}
        message={errorMessage}
        type="error"
      />
    </div>
  );
}

export default ChallengePaint;