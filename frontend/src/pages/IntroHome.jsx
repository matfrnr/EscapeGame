import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/images/logo.png";

const HomePage = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/login'); // Redirige vers la page de connexion
    };
    return (
        <div className="min-h-screen flex flex-col items-center justify-center  text-white p-6">

            {/* Titre */}
            <h1 className="text-3xl font-extrabold text-primary mb-4 animate-pulse text-center mt-12">
                Bienvenue dans notre jeu !
            </h1>

            <img src={logo} alt="Logo" className="w-[180px] drop-shadow-lg" />

            {/* Contenu principal */}
            <div className=" p-6 rounded-lg shadow-lg max-w-lg text-center">
                <p className="text-lg leading-relaxed text-sm">
                    Le <span className="font-semibold text-primary">Bureau des Étudiants</span> est en pleine crise financière après le détournement de
                    <span className="font-bold text-primary"> 10 000 euros </span> par
                    <span className="italic font-bold"> M. Jacquot</span>.
                    Ce dernier a dissimulé l&apos;argent dans un fichier numérique verrouillé par un mot de passe de <br></br>
                    <span className="font-mono bg-gray-700 px-1 rounded">12 caractères</span>.
                </p>

                <p className="mt-4 text-sm">
                    💰 Convaincu d&apos;un coup de génie, il a tout placé en bourse sur la nouvelle version de
                    <span className="text-primary"> Linux</span>... mais c’est un
                    <span className="text-primary font-bold"> désastre !</span> 📉
                    Chaque seconde, <span className="font-bold">1 euro disparaît</span> !
                </p>

                <p className="mt-4 text-yellow-300 font-semibold text-sm">
                    ⚠️ Attention ! Chaque erreur dans les énigmes entraîne une pénalité supplémentaire.
                </p>

                <p className="mt-4 text-sm">
                    <span className="text-lg font-bold mb-4">⏳ Votre mission :</span> <br />
                    🔹 <span className="text-primary">Décoder les indices</span> pour récupérer le mot de passe. <br />
                    🔹 <span className="text-primary">Agir vite</span> et éviter les erreurs. <br />
                    🔹 <span className="text-primary">Sauver les finances</span> du BDE avant qu&apos;il ne soit trop tard !
                </p>

                <p className="mt-4 text-sm">
                    <span className="text-lg font-bold mb-4">👽 Les adeptes :</span> <br />
                    🔹 <span>Au début, chaque joueur choisi un <span className="text-primary">rôle</span></span> <br />
                    🔹 <span >Ce rôle lui confère des <span className="text-primary">specifités</span> spéciales</span><br />
                    🔹 <span>Un <span className="text-primary">chat textuel</span> est mis à disposition au cours de ces épreuves</span>
                </p>


                <button onClick={handleClick} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                    Prêts à relever le défi ?
                </button>
            </div>
        </div>
    );
};

export default HomePage;
