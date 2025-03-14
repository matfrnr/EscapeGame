import {useEffect, useState} from "react";
import Scanner from "../ui/Scanner.jsx";
import Button from "../ui/Button.jsx";
// import {useGameContext} from "../../contexts/GameContext.jsx";
import deductedMoney from "../ui/deductedmoney.js";
import {useLobby} from "../../contexts/LobbyContext.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
import {useChallenge} from "../../contexts/ChallengeContext.jsx";
import {socket} from "../../socket.js";
import Title from "../ui/Title.jsx";
import Challenges from "./challenges.json"
import adepteChallengeCard from "../ui/AdepteChallengeCard.jsx";
import AdepteChallengeCard from "../ui/AdepteChallengeCard.jsx";

const Challenge2 = () => {
    const {nextStep, isQrCodeScanned, setIsQrCodeScanned} = useChallenge();
    const [isAdepte, setIsAdepte] = useState(false);
    const [step, setStep] = useState(1); // Étape actuelle
    const [showResult, setShowResult] = useState(false); // Pour révéler les résultats
    // const { deductMoney} = useGameContext(); // Accès au hook du GameProvider

    const {groupMembers, groupCode} = useLobby();
    const {userInfo} = useAuth();
    useEffect(() => {

        groupMembers.forEach((member) => {
            if (member.adepte === "Jacquot") {

                setIsAdepte(member.id === userInfo.id);
            }
        });
    }, [groupMembers, userInfo, userInfo.id]);

    function handleQrPermission(data) {
        if (data === "Jacquot CMD") {
            socket.emit("qr_code_scanned", {groupCode});

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
            profil_picture: userInfo.profil_picture,
        });
        // Écouter l'événement socket côté client
        const handleQrCodeScanned = () => {
            setIsQrCodeScanned(true);
        };

        socket.on("qr_code_scanned", handleQrCodeScanned);

        // Nettoyage pour éviter les doublons d'écouteurs
        return () => {
            socket.off("qr_code_scanned", handleQrCodeScanned);
        };
    }, []);

    const steps = [
        {
            title: "Introduction",
            message:
                "Tapez cette commande pour voir ce qui se trouve dans le répertoire de départ : ls.",
            result:
                "Plusieurs fichiers/dossiers apparaissent, dont un dossier Départ.",
        },
        {
            title: "Entrer dans le répertoire",
            message: "Entrez dans le répertoire nommé Départ avec : cd Départ.",
            result: "Vous êtes maintenant dans le dossier Départ.",
        },
        {
            title: "Lire un fichier d'instructions",
            message:
                "Un fichier nommé instructions.txt contient des indices. Lisez-le avec : cat instructions.txt.",
            result:
                "Contenu : 'Un dossier nommé .mystery contient la clé pour continuer.'",
        },
        {
            title: "Afficher les dossiers cachés",
            message:
                "Pour afficher les fichiers et dossiers cachés, utilisez : ls -a.",
            result: "Un dossier caché nommé .mystery apparaît.",
        },
        {
            title: "Entrer dans le dossier caché",
            message: "Entrez dans le dossier caché avec : cd",
            result: "Vous êtes maintenant dans le dossier .mystery.",
        },
        {
            title: "Décoder un message (Code César)",
            message:
                "Lisez le fichier simple_code.txt. Décodage : Chaque lettre est décalée de 3 vers l'avant dans l'alphabet.",
            result: "Contenu : 'Vhzdu', qui signifie 'Secret'.",
        },
        {
            title: "Rechercher un fichier contenant le mot clé",
            message:
                "Cherchez un fichier contenant le code avec : grep -i CodeSecret *.",
            result: "Un fichier nommé clef_indice.txt est trouvé.",
        },
        {
            title: "Résoudre une énigme mathématique",
            message:
                "Le fichier trouvé contient une équation : Résolvez la pour trouver le numéro du fichier à ouvrir.",
            result: "Solution : x = 3, donc ouvrez le fichier indice3.txt.",
        },
        {
            title: "Lire un indice pour localiser l'archive",
            message:
                "Lisez le fichier qui corresopnd à la réponse de l'équation pour obtenir des informations sur l'archive avec : cat resultatEquation.txt.",
            result:
                "Contenu : 'L'archive archive.zip contient des informations cruciales.'",
        },
        {
            title: "Trouver un fichier dans une archive",
            message: "Suivez les consignes inscrites dans le fichier pour continuer.",
            result: "Tapez unzip archive.zip pour extraire les fichiers.",
        },
        {
            title: "Lire le fichier d'indice",
            message:
                "Lisez le fichier .txt qui a été extrait pour connaître la prochaine étape avec : cat nomDuFichier.txt.",
            result: "Contenu : 'Cherchez l'image nommée image_mystere.png.'",
        },
        {
            title: "Trouver et ouvrir une image",
            message: "Recherchez et ouvrez l'image avec : open nomDeImage.png.",
            result: "L'image finale s'affiche : Bob l'éponge flottant dans le ciel !",
        },
    ];

    const handleQRCodeSuccess = (data) => {
        if (data === "Epreuve réussite") {
            return nextStep();
        }
        alert("QR Code invalide");
    };

    const nextStepCard = () => {
        if (step < steps.length) {
            setStep((prev) => prev + 1);
            setShowResult(false); // Réinitialiser l'affichage du résultat pour la prochaine étape
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep((prev) => prev - 1);
            setShowResult(false); // Réinitialiser l'affichage du résultat pour la précédente étape
        }
    };

    const revealResult = () => {
            deductedMoney();
            setShowResult(true);
    };

    const challenge = Challenges.find((c) => c.id === 2);

    if (!isQrCodeScanned && !isAdepte) {
        return (
            <div>
                <AdepteChallengeCard adepteOf={"Jacquot"}/>
                <Title className="text-primary uppercase">
                    {challenge.title}
                </Title>
                <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight animate-pulse">{challenge.descriptionNonAdepte}</p>
            </div>
        );
    }

    if (!isQrCodeScanned && isAdepte) {
        return (

            <div className="flex flex-col items-center justify-center space-y-4">
                <AdepteChallengeCard adepteOf={"Jacquot"}/>
                <Title className="text-primary uppercase">
                    {challenge.title}
                </Title>
                <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight animate-pulse">{challenge.descriptionAdepte}</p>
                <Scanner className="w-full flex-grow" onSuccess={handleQrPermission}/>
            </div>
        );
    }

    if (isAdepte) {
        return (
            <div>
                <AdepteChallengeCard adepteOf={"Jacquot"}/>
                <Title className="text-primary uppercase">
                    {challenge.title}
                </Title>
                <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
                <div className="mt-12 space-y-4 rounded-lg bg-neutral-700 p-4 font-mono text-white shadow-md">
                    <h2 className="text-lg font-bold">
                        Étape {step}: {steps[step - 1].title}
                    </h2>
                    <p>{steps[step - 1].message}</p>
                    {steps[step - 1].result && (
                        <div className="mt-2">
                            {showResult ? (
                                <p className="text-yellow-300">
                                    Résultat attendu : {steps[step - 1].result}
                                </p>
                            ) : (
                                <Button onClick={revealResult} variant="outline" className="mt-2">
                                    Révéler le résultat (2 points)
                                </Button>
                            )}
                        </div>

                    )}
                </div>
                <div className="mt-4 flex justify-between">
                    <Button
                        onClick={prevStep}
                        disabled={step === 1}
                        variant="dark"
                        className="rounded-none border"
                    >
                        Précédent
                    </Button>
                    <Button onClick={nextStepCard} disabled={step === steps.length}>
                        Suivant
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Title className="text-primary uppercase">
                {challenge.title}
            </Title>
            <p className="mb-5 text-neutral-50/50 font-mono text-xs tracking-tight">{challenge.description}</p>
            <Scanner onSuccess={handleQRCodeSuccess}/>
        </div>
    );
};

export default Challenge2;

//mkdir -p JeuMystere/{Documents,Photos,Videos,Musique,Départ/.mystery} && cd JeuMystere && echo "Rien d'intéressant ici..." > Documents/note.txt && echo "Juste des photos de vacances" > Photos/vacances.txt && echo "Playlist d'été" > Musique/playlist.txt && echo "Un dossier nommé .mystery contient la clé pour continuer." > Départ/instructions.txt && echo "Cette piste ne mène nulle part..." > Départ/fausse_piste1.txt && echo "Essayez encore..." > Départ/fausse_piste2.txt && echo "Vhfuhw" > Départ/.mystery/simple_code.txt && echo "Secret: 3x + 2 = 11" > Départ/.mystery/clef_indice.txt && echo "Résolvez : 2x - 3 = 3" > Départ/.mystery/enigme.txt && echo "L'archive archive.zip contient des informations cruciales. Peut-être faudrait-il le déziper avec la commande unzip archive.zip ?" > Départ/.mystery/indice3.txt && echo "Mauvaise piste..." > Départ/.mystery/indice1.txt && echo "Pas ici non plus..." > Départ/.mystery/indice2.txt && echo "Presque..." > Départ/.mystery/indice4.txt && echo "Dommage..." > Départ/.mystery/indice5.txt && echo "Cherchez l'image nommée image_mystere.png." > Départ/.mystery/image_hint.txt && cp "/Users/quentinbauduin/Downloads/qr_code_epreuve_reussite.png" Départ/.mystery/image_mystere.jpg && cd Départ/.mystery && zip archive.zip image_hint.txt image_mystere.jpg  && rm image_hint.txt image_mystere.jpg && cd ../../.. && chmod -R 755 . && chmod 644 $(find . -type f)
