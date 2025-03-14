import { useEffect, useState } from "react";
import Button from "../ui/Button";
import AdepteChallengeCard from "../ui/AdepteChallengeCard";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useChallenge } from "../../contexts/ChallengeContext.jsx";
import Title from "../ui/Title.jsx";
import { socket } from "../../socket.js";
import Challenges from "./challenges.json";
import Scanner from "../ui/Scanner.jsx";

function Challenge9() {
    const { nextStep, isQrCodeScanned, setIsQrCodeScanned } = useChallenge();
    const [isAdepte, setIsAdepte] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [wordsGrid, setWordsGrid] = useState([]);
    const [selectedWords, setSelectedWords] = useState([]);
    const [correctWords] = useState(["Ami", "Loyal", "Courage", "Fidèle", "Honnête"]);
    const [messages, setMessages] = useState([]);
    const [messageCount, setMessageCount] = useState(0);
    const [newMessage, setNewMessage] = useState("");

    const { groupMembers, groupCode } = useLobby();
    const { userInfo } = useAuth();

    function handleQrPermission(data) {
        if (data === "Geraud Pinet Code Names") {
            socket.emit("qr_code_scanned", { groupCode });
            setIsQrCodeScanned(true);
        } else {
            alert("QR Code invalide");
        }
    }

    useEffect(() => {
        if (!groupMembers || groupMembers.length === 0) {
            return;
        }

        groupMembers.forEach((member) => {
            if (member.adepte === "Guéraud-Pinet") {
                setIsAdepte(member.id === userInfo.id);
            }
        });

        socket.emit("join_challenge", {
            groupCode: groupCode,
            id: userInfo.id,
            username: userInfo.username,
            groupMembers: groupMembers,
        });
    }, [groupCode, groupMembers, userInfo]);

    useEffect(() => {
        const handleUpdateGrid = ({ words }) => {
            setWordsGrid(words);
        };

        socket.on("update_grid", handleUpdateGrid);

        socket.on("challenge_attempt_response", ({ success, message }) => {
            setFeedback(message);
            if (success) {
                nextStep();
            }
        });

        socket.on("receive_message", ({ message }) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
            socket.off("update_grid", handleUpdateGrid);
            socket.off("challenge_attempt_response");
            socket.off("receive_message");
        };
    }, [nextStep]);

    const handleWordSelect = (word) => {
        setSelectedWords((prevSelectedWords) =>
            prevSelectedWords.includes(word)
                ? prevSelectedWords.filter((w) => w !== word)
                : [...prevSelectedWords, word]
        );
    };

    const handleSubmit = () => {
        if (selectedWords.length === 0) {
            setFeedback("❌ Vous devez sélectionner plusieurs mots.");
            return;
        }

        const allCorrectWordsSelected = correctWords.every(word => selectedWords.includes(word));
        if (!allCorrectWordsSelected) {
            setFeedback("❌ La réponse est incorrecte.");
            return;
        }

        setFeedback("✅ Réponse correcte !");
        nextStep();
        setSelectedWords([]);
    };

    const handleSendMessage = () => {
        const forbiddenWords = ["ami", "loyal", "courage", "fidèle","fidele", "honnête"];
        const forbiddenPattern = new RegExp(forbiddenWords.join("|"), "i");

        if (messageCount >= 5) {
            alert("❌ Vous avez envoyé le maximum de messages.");
            return;
        }

        if (forbiddenPattern.test(newMessage)) {
            alert("❌ Vous ne pouvez pas envoyer ce mot.");
            return;
        }

        if (/\s/.test(newMessage)) {
            alert("❌ Les messages ne peuvent pas contenir d'espaces.");
            return;
        }

        socket.emit("send_message", {
            groupCode: groupCode,
            message: newMessage,
        });

        setMessageCount(messageCount + 1);
        setNewMessage("");
    };

    const challenge = Challenges.find((c) => c.id === 9);

    if (!isQrCodeScanned && !isAdepte) {
        return (
            <div>
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
                <Title className="text-primary uppercase">{challenge.title}</Title>
                <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.descriptionAdepte}</p>
                <Scanner className="w-full flex-grow" onSuccess={handleQrPermission} />
            </div>
        );
    }

    if (isAdepte) {
        return (
            <div className="space-y-4">
                <AdepteChallengeCard adepteOf={"Guéraud-Pinet"} />
                <Title className="text-center">{challenge.title}</Title>
                <p className="mb-10 text-center">{challenge.description}</p>
                <div className="grid grid-cols-4 gap-2">
                    {wordsGrid.map((entry, index) => (
                        <div
                            key={index}
                            className="p-2 rounded-md bg-neutral-600"
                        >
                            {entry.word}
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-2 rounded-md bg-neutral-800">
                    <p className="text-green-400">Voici les mots à faire deviner:</p>
                    <p>{correctWords.join(", ")}</p>
                </div>
                <div className="mt-4 p-2 rounded-md bg-neutral-800">
                    <p className="text-green-400">Envoyer un message:</p>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full p-2 rounded-md bg-neutral-700"
                    />
                    <Button onClick={handleSendMessage} className="w-full mt-2">
                        Envoyer
                    </Button>
                    <p className="text-gray-400">Messages restants: {5 - messageCount}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Title className="text-center">{challenge.title}</Title>
            <p className="text-center">{challenge.description}</p>
            <div className="space-y-4 rounded-lg bg-neutral-700 p-3">
                <div className="grid grid-cols-4 gap-2">
                    {wordsGrid.map((entry, index) => (
                        <button
                            key={index}
                            onClick={() => handleWordSelect(entry.word)}
                            className={`p-2 rounded-md ${
                                selectedWords.includes(entry.word)
                                    ? "bg-blue-500"
                                    : "bg-neutral-600 hover:bg-neutral-500"
                            }`}
                        >
                            {entry.word}
                        </button>
                    ))}
                </div>
                <Button onClick={handleSubmit} className="w-full mt-4">
                    Validate selection
                </Button>
            </div>
            {feedback && (
                <div className="mt-4 p-2 rounded-md bg-neutral-800">
                    <p>{feedback}</p>
                </div>
            )}
            <div className="mt-4 p-2 rounded-md bg-neutral-800">
                <p className="text-green-400">Messages reçus:</p>
                {messages.map((msg, index) => (
                    <p key={index} className="text-white">{msg}</p>
                ))}
            </div>
        </div>
    );
}

export default Challenge9;