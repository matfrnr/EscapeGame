import {useEffect, useRef, useState} from "react";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import AdepteChallengeCard from "../ui/AdepteChallengeCard";
import Scanner from "../ui/Scanner.jsx";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChallenge } from "../../contexts/ChallengeContext.jsx";
import Title from "../ui/Title.jsx";
import { socket } from "../../socket.js";
import Challenges from "./challenges.json";
import { useGameContext } from "../../contexts/GameContext.jsx";

function Challenge10() {
  const { nextStep, isQrCodeScanned, setIsQrCodeScanned } = useChallenge();
  const [isAdepte, setIsAdepte] = useState(false);
  const [message, setMessage] = useState("");
  const [vigenereKey, setVigenereKey] = useState(""); // Clé pour Vigenère
  const [vigenereMessage, setVigenereMessage] = useState(""); // Message à décrypter
  const [decryptedVigenereMessage, setDecryptedVigenereMessage] = useState(""); // Message décrypté
  const [accordionOpen, setAccordionOpen] = useState(null); // Gestion des accordéons
  const scannerRef = useRef(null);
  //décalage césar de 3
  const cryptedMessage = "OOKfgvtguug";
  const decryptedMessage = "MMIdetresse";
  const { deductMoney } = useGameContext();

  const { groupMembers, groupCode } = useLobby();
  const { userInfo } = useAuth();
  useEffect(() => {
    // Déterminer si l'utilisateur est l'adepte
    groupMembers.forEach((member) => {
      if (member.adepte === "Jacquot") {
        setIsAdepte(member.id === userInfo.id);
      }
    });
  }, [groupMembers, userInfo.id]);

  useEffect(() => {
    if (!isQrCodeScanned && isAdepte && !scannerRef.current) {
      scannerRef.current = <Scanner className="w-full flex-grow" onSuccess={handleQrPermission} />;
    }
  }, [isQrCodeScanned, isAdepte]);


  const normalizeString = (str) => {
    return str.replace(/\s+/g, '').toLowerCase();
  };

  function handleQrPermission(data) {
    if (data === "Jacquot Crypté") {
      socket.emit("qr_code_scanned", { groupCode });

      // Mettre à jour le contexte pour l'adepte
      setIsQrCodeScanned(true);
    } else {
      alert("QR Code invalide");
    }
  }

  useEffect(() => {
    socket.emit("join_challenge", {
      groupCode: groupCode,
      id: userInfo.id,
      username: userInfo.username,
      profil_picture: userInfo.profil_picture
    });
    // Écouter l'événement socket côté client
    const handleQrCodeScanned = () => {
      setIsQrCodeScanned(true);
    };

    socket.on("qr_code_scanned", handleQrCodeScanned);
    socket.on("challenge_attempt", ({ challenge, attempt }) => {
      if (challenge === 10) {
        deductMoney(4444);
      }
    });

    // Nettoyage pour éviter les doublons d'écouteurs
    return () => {
      socket.off("qr_code_scanned", handleQrCodeScanned);
      socket.off("challenge_attempt");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim().length === 0) {
      alert("Le champ message est vide");
      return;
    }

    const normalizedInput = normalizeString(message);
    const normalizedDecryptedMessage = normalizeString(decryptedMessage);

    if (normalizedInput !== normalizedDecryptedMessage) {
      socket.emit("challenge_attempt", { challenge: 10, attempt: message });
      alert("Message incorrect");
    } else {
      nextStep();
    }
  };

  const decryptVigenere = () => {
    if (!vigenereKey || !vigenereMessage) {
      alert("Veuillez entrer une clé et un message à décrypter");
      return;
    }
    let decrypted = "";
    for (let i = 0; i < vigenereMessage.length; i++) {
      const char = vigenereMessage[i];
      const keyChar = vigenereKey[i % vigenereKey.length];
      if (char.match(/[A-Za-z]/)) {
        const shift = keyChar.toLowerCase().charCodeAt(0) - 97;
        const base = char === char.toUpperCase() ? 65 : 97;
        decrypted += String.fromCharCode(
          ((char.charCodeAt(0) - base - shift + 26) % 26) + base
        );
      } else {
        decrypted += char;
      }
    }
    setDecryptedVigenereMessage(decrypted);
  };

  const toggleAccordion = (index) => {
    setAccordionOpen(accordionOpen === index ? null : index);
  };

  const challenge = Challenges.find((c) => c.id === 10);

  if (!isQrCodeScanned && !isAdepte) {
    return (
      <div>
        <AdepteChallengeCard adepteOf={"Jacquot"} />
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.descriptionNonAdepte}</p>
      </div>
    );
  }

  if (!isQrCodeScanned && isAdepte) {
    return (
      <div>
        <AdepteChallengeCard adepteOf={"Jacquot"} />
        <Title className="text-primary uppercase">
          {challenge.title}
        </Title>
        <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.descriptionAdepte}</p>
        <div className="flex flex-col items-center justify-center space-y-4">
          {scannerRef.current}
        </div>
      </div>
    );
  }

  if (isAdepte) {
    return (
      <div className="space-y-4">
        <AdepteChallengeCard adepteOf={"Jacquot"} />
        <Title>{challenge.title}</Title>
        <p className="mb-10 text-center">{challenge.description}</p>

        <p>Voici des helpers pour vous aider à guider votre équipe :</p>

        {/* Explications et accordéons */}
        <div className="space-y-4">
          {[
            {
              name: "Code César",
              description:
                "Chaque lettre du message est décalée d’un certain nombre dans l’alphabet. Exemple : DWWDFN → ATTACK avec un décalage de 3.",
              helper: (
                <div className="rounded-md bg-neutral-600 p-3 font-mono text-neutral-50">
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ
                </div>
              )
            },
            {
              name: "Code Morse",
              description:
                "Chaque lettre ou chiffre est traduit en une séquence de points et de tirets. Exemple : SOS = ... --- ....",
              helper: (
                <div className="rounded-md bg-neutral-600 p-3 font-mono text-neutral-50">
                  <p>
                    A: .- | B: -... | C: -.-. | D: -.. | E: . | F: ..-. | G: --.
                    | H: .... | I: .. | J: .--- | K: -.- | L: .-.. | M: -- | N:
                    -. | O: --- | P: .--. | Q: --.- | R: .-. | S: ... | T: - |
                    U: ..- | V: ...- | W: .-- | X: -..- | Y: -.-- | Z: --..
                  </p>
                  <br />
                  <p>
                    0: ----- | 1: .---- | 2: ..--- | 3: ...-- | 4: ....- | 5:
                    ..... | 6: -.... | 7: --... | 8: ---.. | 9: ----.
                  </p>
                  <br />
                  <p>SOS = ... --- ...</p>
                </div>
              )
            },
            {
              name: "Code Vigenère",
              description:
                "Ce cryptage utilise un mot-clé pour chiffrer un message. Exemple : ATTACK avec le mot-clé KEY devient KGCYKQ.",
              helper: (
                <div className="space-y-4">
                  <TextInput
                    value={vigenereKey}
                    onChange={(e) => setVigenereKey(e.target.value)}
                    placeholder="Mot-clé (ex : KEY)"
                    className="w-full"
                  />
                  <TextInput
                    value={vigenereMessage}
                    onChange={(e) => setVigenereMessage(e.target.value)}
                    placeholder="Message à décrypter"
                    className="w-full"
                  />
                  <Button onClick={decryptVigenere} className="mt-2 w-full">
                    Décrypter
                  </Button>
                  {decryptedVigenereMessage && (
                    <div className="mt-4 rounded-md bg-neutral-600 p-3">
                      <p className="font-mono text-green-400">
                        Message décrypté : {decryptedVigenereMessage}
                      </p>
                    </div>
                  )}
                </div>
              )
            },
            {
              name: "Substitution",
              description:
                "Chaque lettre est remplacée par un symbole ou une autre lettre. Exemple : A = @, B = %, C = #.",
              helper: (
                <p>
                  Décodage manuel : Remplacez chaque symbole par sa lettre
                  correspondante.
                </p>
              )
            }
          ].map((item, index) => (
            <div key={item.name} className="rounded-lg bg-neutral-800 shadow">
              <button
                className="flex w-full items-center justify-between rounded-lg bg-neutral-800 p-3 text-left text-white"
                onClick={() => toggleAccordion(index)}
              >
                <span>{item.name}</span>
                <span>{accordionOpen === index ? "-" : "+"}</span>
              </button>
              {accordionOpen === index && (
                <div className="space-y-2 bg-neutral-800 p-4 text-white">
                  <p className="font-mono text-neutral-50/80">
                    {item.description}
                  </p>
                  {item.helper}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3">
      <AdepteChallengeCard adepteOf={"Jacquot"} />
      <div className="flex flex-col space-y-4 rounded-lg bg-neutral-700 p-3">
        <div className="space-y-2">
          <h3 className="text-lg">Message crypté à décrypter</h3>
          <p className="rounded-md bg-neutral-600 p-3 font-mono text-neutral-50">
            {cryptedMessage}
          </p>
        </div>
        <label className="space-y-4">
          Entrez le message décrypté :
          <TextInput
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message décrypté"
            className="w-full"
          />
        </label>
        <Button type="submit" className="w-full">
          Soumettre
        </Button>
      </div>
    </form>
  );
}

export default Challenge10;
