import {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button.jsx";
import Scanner from "../ui/Scanner.jsx";
import { useChallenge } from "../../contexts/ChallengeContext.jsx";
import Title from "../ui/Title.jsx";
import { socket } from "../../socket";
import {useLobby} from "../../contexts/LobbyContext.jsx"; // Assurez-vous d'importer votre instance socket
import {useGameContext} from "../../contexts/GameContext.jsx";

export default function EndingGame() {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [countdown, setCountdown] = useState(null); // Timer visible
    const { currentKey } = useChallenge();
    const navigate = useNavigate();
    const key = localStorage.getItem("key");
    const { groupCode } = useLobby();
    const {money, stopGame} =useGameContext()
    const scannerRef = useRef(null);

    // Fonction appelée lorsqu'un membre scanne le QR code
    function handleEndGame(data) {
        if (data === "Fin" && key === currentKey) {
            alert("Bravo vous avez fini le jeu !");
            socket.emit("end_game_success", { groupCode });

            // Déclencher le compte à rebours pour l'utilisateur qui a scanné
            stopGame();
            handleapiending();
            startCountdown();

        } else {
            alert("QR Code invalide");
        }
    }
    const handleapiending = async () => {
        try {
            const newEndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

            console.log("Données envoyées à l'API:", {code: groupCode, endTime: newEndTime});

            // Appel API 1: mise à jour de l'heure de fin
            const response1 = await fetch('/api/groups/updateEndTime', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({groupCode: groupCode, endTime: newEndTime}),
            });

            if (!response1.ok) {
                const errorData1 = await response1.json();
                console.error("Erreur API 1:", errorData1.message);
                alert("Une erreur est survenue lors de la mise à jour de l'heure de fin.");
                return;
            }

            // Appel API 2: mise à jour du score
            const response2 = await fetch('/api/groups/updateScore', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({groupCode: groupCode, score: money}),
            });

            if (!response2.ok) {
                const errorData2 = await response2.json();
                console.error("Erreur API 2:", errorData2.message);
                alert("Une erreur est survenue lors de la mise à jour du score.");
                return;
            }
        } catch (error) {
            console.error("Erreur lors des appels API:", error);
            alert("Une erreur est survenue lors de l'exécution des appels API.");
        }
    };

            // Démarrer le compte à rebours
    function startCountdown() {
        setCountdown(5);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(timer); // Arrêter le timer
                    navigate("/scoreboard"); // Redirection
                }
                return prev - 1; // Décrémenter
            });
        }, 1000);
    }

    // Écouter l'événement socket pour synchroniser l'équipe
    useEffect(() => {
        socket.on("end_game_trigger", () => {
            startCountdown(); // Lancer le compte à rebours pour tous les membres
        });

        // Nettoyage
        return () => {
            socket.off("end_game_trigger");
        };
    }, []);

    useEffect(() => {
        if (isCameraOpen && !countdown && !scannerRef.current) {
            scannerRef.current = <Scanner onSuccess={handleEndGame} />;
        }
    }, [isCameraOpen, countdown]);

    return (
        <div>
            <Title className="text-center" level={2}>Fin du jeu</Title>
            <p className="text-neutral-50/40 mt-4">
                Bravo vous avez fini le jeu ! Rendez-vous en /*numéro salle*/ pour valider votre clé et accéder au
                classement.
            </p>

            <div className="flex items-center justify-center mt-10">
                {!isCameraOpen && countdown === null && <Button onClick={() => setIsCameraOpen(true)}>Scanner le QR Code</Button>}
                {countdown !== null && (
                    <p className="text-xl font-bold text-red-500 text-center">
                        Redirection dans {countdown} seconde{countdown > 1 ? "s" : ""}...
                    </p>

                )}
                {isCameraOpen && !countdown && scannerRef.current}
            </div>
        </div>
    );
}