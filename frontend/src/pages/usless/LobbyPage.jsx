// src/pages/LobbyPage.jsx
import React, { useState } from 'react';

const LobbyPage = () => {
    // États pour stocker le nom de l'équipe, le code de l'équipe et la liste des équipes
    const [teamName, setTeamName] = useState('');
    const [teamCode, setTeamCode] = useState('');
    const [teams, setTeams] = useState([]);

    // Fonction pour créer une nouvelle équipe
    const handleCreateTeam = () => {
        if (teamName.trim() === '') return alert("Le nom de l'équipe est requis.");

        const newTeam = {
            name: teamName,
            code: Math.random().toString(36).substr(2, 5).toUpperCase(), // Génération d'un code unique
            members: [],
        };

        setTeams([...teams, newTeam]);
        setTeamName('');
        alert(`Équipe "${newTeam.name}" créée avec le code : ${newTeam.code}`);
    };

    // Fonction pour rejoindre une équipe avec un code
    const handleJoinTeam = () => {
        const foundTeam = teams.find((team) => team.code === teamCode.toUpperCase());

        if (foundTeam) {
            foundTeam.members.push('Utilisateur'); // Ajout de l'utilisateur dans l'équipe
            setTeamCode('');
            alert(`Vous avez rejoint l'équipe "${foundTeam.name}"`);
        } else {
            alert("Aucune équipe trouvée avec ce code.");
        }
    };

    return (
        <div className="flex flex-col justify-center min-h-screen bg-gray-800 text-white">
            <h1 className="text-4xl font-bold mb-8">Lobby</h1>

            {/* Formulaire de création d'équipe */}
            <div className="bg-gray-700 p-6 rounded-lg mb-8 w-80">
                <h2 className="text-2xl font-semibold mb-4">Créer une équipe</h2>
                <input
                    type="text"
                    placeholder="Nom de l'équipe"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full p-2 mb-4 rounded text-gray-800"
                />
                <button
                    onClick={handleCreateTeam}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                >
                    Créer l'équipe
                </button>
            </div>

            {/* Formulaire de rejoindre une équipe */}
            <div className="bg-gray-700 p-6 rounded-lg mb-8 w-80">
                <h2 className="text-2xl font-semibold mb-4">Rejoindre une équipe</h2>
                <input
                    type="text"
                    placeholder="Code de l'équipe"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    className="w-full p-2 mb-4 rounded text-gray-800"
                />
                <button
                    onClick={handleJoinTeam}
                    className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                >
                    Rejoindre l'équipe
                </button>
            </div>

            {/* Affichage des équipes créées */}
            <div className="w-80">
                <h2 className="text-2xl font-semibold mb-4">Équipes créées</h2>
                {teams.length === 0 ? (
                    <p>Aucune équipe créée pour le moment.</p>
                ) : (
                    <ul className="bg-gray-700 p-4 rounded-lg space-y-4">
                        {teams.map((team, index) => (
                            <li key={index} className="border-b border-gray-600 pb-2">
                                <p className="font-bold">Équipe : {team.name}</p>
                                <p>Code : {team.code}</p>
                                <p>Membres : {team.members.length}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LobbyPage;