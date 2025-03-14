import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../socket.js";
import { useChallenge } from "./ChallengeContext.jsx";
import { useLobby } from "./LobbyContext.jsx";
import { useAuth } from "./AuthContext.jsx";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const { currentStep } = useChallenge();
    const { groupCode } = useLobby();
    const { userInfo } = useAuth();

    const [money, setMoney] = useState(() => {
        const savedMoney = localStorage.getItem("money");
        return savedMoney !== null && !isNaN(Number(savedMoney)) ? Number(savedMoney) : 0;
    });

    const [gameStarted, setGameStarted] = useState( () => {
        const savedGameStarted = localStorage.getItem("gameStarted");
        return savedGameStarted !== null ? savedGameStarted : false;
    });

    const [usedHints, setUsedHints] = useState(() => {
        const savedHints = localStorage.getItem("usedHints");
        return savedHints ? JSON.parse(savedHints) : [
            "challenge1-hint2",
            "challenge2-hint1", "challenge2-hint2", "challenge2-hint3",
            "challenge4-hint1",
            "challenge6-hint1", "challenge6-hint2",
            "challenge7-hint1", "challenge7-hint2", "challenge7-hint3",
            "challenge8-hint1", "challenge8-hint2", "challenge8-hint3",
            "challenge9-hint1", "challenge9-hint2", "challenge9-hint3",
            "challenge10-hint1", "challenge10-hint2",
            "challenge11-hint1",
            "challenge12-hint1", "challenge12-hint2", "challenge12-hint3",

        ];
    });

    useEffect(() => {
        if (gameStarted) {
            const interval = setInterval(() => {
                setMoney((prevMoney) => {
                    const newMoney = Math.max(prevMoney - 1, 0); // Empêche les valeurs négatives
                    localStorage.setItem("money", newMoney.toString()); // Sauvegarde locale
                    return newMoney;
                });
            }, 1000); // -1 par seconde

            return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage
        }
    }, [gameStarted]);

    const [currentChallenge, setCurrentChallenge] = useState(`challenge${currentStep}`);

    const [startTime, setStartTime] = useState(() => {
        const savedStartTime = localStorage.getItem("startTime");
        return savedStartTime || null;
    });

    const [deductedMoneyTotal, setDeductedMoneyTotal] = useState( () => {
        const savedDeductedMoneyTotal = localStorage.getItem("deductedMoneyTotal");
        return savedDeductedMoneyTotal || 0;
    });

    useEffect(() => {
        setCurrentChallenge(`challenge${currentStep}`);
    }, [currentStep]);

    const hints = {
        challenge1: {
            hint1: "Les QR codes sont dissimulés dans des salles dont les numéros totalisent 9.",
            hint2: "Désactivé",
            //hint3: "Les salles à explorer sont : 108, 117, et 216."
            hint3: "Exemple de combinaison : Salle 414 (elle n'existe pas évidemment). Essayez d'autres combinaisons similaires."
        },
        challenge2: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Désactivé"
        },
        challenge3: {
            hint1: "Concentrez-vous sur les pièces mobiles des blancs pour mater en un coup.",
            hint2: "Le cavalier joue un rôle clé dans cette énigme.",
            //hint3: "Déplacez le cavalier en H4 pour obtenir un mat immédiat."
            hint3: "Essayer les coups vers la droite de l'échiquier."
        },
        challenge4: {
            hint1: "Désactivé",
            hint2: "Regardez aux extrémités de l'IUT.",
            hint3: "Les marqueur sont situés: vers les poubelles, au niveau du parking a vélo dans parking des profs et vers le parking a vélo des élèves au niveau du petit batiment noir",
        },
        challenge5: {
            hint1: "Le choix de tableaux a été réduit à 10.",
            hint2: "Le choix de tableaux a été réduit à 6.",
            hint3: "Le choix de tableaux a été réduit à 3."
        },
        challenge6: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Essayez de bouger votre téléphone d'avant en arrière pour voir les lettres cachées."
        },
        challenge7: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Désactivé"
        },
        challenge8: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Désactivé"
        },
        challenge9: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Désactivé"
        },
        challenge10: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Une partie du message est: ********Detresse"
        },
        challenge11: {
            hint1: "Désactivé",
            hint2: "Associez les voix aux noms des professeurs pour débloquer l'indice.",
            hint3: "2 profs de développement emblématiques, une prof de vidéo, et une prof de communication."
        },
        challenge12: {
            hint1: "Désactivé",
            hint2: "Désactivé",
            hint3: "Désactivé"
        }
    };

    useEffect(() => {
        localStorage.setItem("money", money.toString());
        localStorage.setItem("usedHints", JSON.stringify(usedHints));
    }, [money, usedHints]);

    useEffect(() => {
        if (!socket) return;

        const Interval = setInterval(() => {
            const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const elapsedTime = new Date(currentTime) - new Date(startTime);
            const newMoney = Math.max(60000 - elapsedTime/1000 - deductedMoneyTotal, 0);
            if (newMoney !== money) {
                setMoney(newMoney);
            }
        }, 15000); //toute les 15 secondes

        return () => {
            clearInterval(Interval);
        }

    }, [deductedMoneyTotal, startTime]);

    useEffect(() => {
        const pathname = window.location.pathname;
        const match = pathname.match(/challenge\/(\d+)/);
        if (match) {
            setCurrentChallenge(`challenge${match[1]}`);
        }
    }, [window.location.pathname]);

    // Hint synchronization
    useEffect(() => {
        if (!socket) return;

        // Listen for hint updates from other clients
        socket.on("hint_used_sync", ({ hintId, cost }) => {
            deductMoney(cost);
            setUsedHints(prev => {
                if (!prev.includes(hintId)) {
                    const updatedHints = [...prev, hintId];
                    localStorage.setItem("usedHints", JSON.stringify(updatedHints));
                    return updatedHints;
                }
                return prev;
            });
        });

        return () => {
            socket.off("hint_used_sync");
        };
    }, []);

    const addUsedHint = (hintId, cost) => {

        // Update local state first
        setUsedHints(prev => {
            const updatedHints = [...prev, hintId];
            localStorage.setItem("usedHints", JSON.stringify(updatedHints));
            return updatedHints;
        });

        // Emit to socket for synchronization
        if (socket && groupCode) {
            socket.emit("hint_used", { groupCode: groupCode, hintId: hintId, cost: cost });
        }
    };

    const launchGame = (newStartTime) => {
        socket.emit("start_game", { groupCode, startTime: newStartTime });
    }

    const deductMoney = (amount) => {
        if (isNaN(amount) || amount < 0) {
            console.error("Invalid amount provided for deduction:", amount);
            return;
        }

        const groupCode = localStorage.getItem("groupCode"); // Récupérer le code du groupe
        if (!groupCode || !socket) {
            console.error("Group code or socket not available");
            return;
        }

        setMoney((prev) => {
            setDeductedMoneyTotal(prev => prev + amount);
            const newMoney = Math.max(prev - amount, 0); // Empêcher les valeurs négatives

            localStorage.setItem("money", newMoney);

            // Envoyer la mise à jour au serveur
            socket.emit("apply_penalty", { groupCode, penaltyAmount: amount });

            return newMoney;
        });
    };

    const stopGame = () => {
        setGameStarted(false);
        localStorage.setItem("gameStarted", "false");
    }

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_challenge', {
            groupCode,
            id: userInfo.id,
            username: userInfo.username,
            profil_picture: userInfo.profil_picture
        });

        const handleMoneyUpdated = ({ updatedMoney }) => {
            if (!isNaN(updatedMoney) && updatedMoney !== money) {
                setMoney(updatedMoney); // Mettre à jour l'état local
                localStorage.setItem("money", updatedMoney.toString());
            }
        };

        socket.on("money_updated", handleMoneyUpdated);
        socket.on("game_started", ({ startTime }) => {
            setStartTime(startTime);
            localStorage.setItem("startTime", startTime);
            setMoney(60000);
            localStorage.setItem("money", "60000");
            setGameStarted(true);
            localStorage.setItem("gameStarted", "true");
        });

        socket.on("money_sync", ({ updatedMoney }) => {
            setMoney(updatedMoney);
            localStorage.setItem("money", updatedMoney);
        });

        return () => {
            socket.off("money_updated", handleMoneyUpdated);
            socket.off("game_started");
            socket.off("money_sync");
        };
    }, [groupCode, money, userInfo.id, userInfo.profil_picture, userInfo.username]);

    return (
        <GameContext.Provider
            value={{
                money,
                deductMoney,
                usedHints,
                addUsedHint,
                currentChallenge,
                setCurrentChallenge,
                hints,
                launchGame,
                stopGame,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

// Hook pour accéder au contexte
export const useGameContext = () => useContext(GameContext);