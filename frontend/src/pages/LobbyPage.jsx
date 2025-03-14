import { useEffect, useState } from 'react';
import { useLobby } from '../contexts/LobbyContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useChallenge } from "../contexts/ChallengeContext.jsx";
import { FaEdit } from 'react-icons/fa';
import { useGameContext } from "../contexts/GameContext.jsx";
import Button from "../components/ui/Button.jsx";
import PlayerCard from "../components/ui/PlayerCard.jsx";
import { socket } from '../socket';
import axios from "axios";


const LobbyPage = () => {
  const { nextStep, resetGame} = useChallenge();
  const { groupCode, setGroupCode, groupMembers, setGroupMembers, groupName, setGroupName, setIsInLobby } = useLobby();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [newGroupName, setNewGroupName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [hasReadRules, setHasReadRules] = useState(() => {
    return localStorage.getItem(`hasReadRules_${groupCode}`) === 'true'
  });
  const { launchGame } = useGameContext();

  useEffect(() => {
    const handleGroupInfo = (groupInfo) => {
      setGroupName(groupInfo.name);
      setGroupMembers(groupInfo.members.filter(member => member.id && member.username && member.socketId));
    };

    socket.emit('get_group_info', { code: groupCode });
    socket.on('group_info', handleGroupInfo);
    socket.emit('get_group_info', { code: groupCode });
    socket.on('group_info', handleGroupInfo);

    return () => {
      socket.off('group_info', handleGroupInfo);
    };
  }, [groupCode, setGroupMembers]);

  useEffect(() => {
    const allRolesAssigned = groupMembers.length === 1   &&
      groupMembers.every(member => member.adepte !== undefined && member.adepte !== null);
    setIsButtonDisabled(!allRolesAssigned || !hasReadRules);
  }, [groupMembers, hasReadRules]);

  const handleLeaveGroup = async () => {
    try {
      const response = await fetch('/api/groups/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: groupCode, userId: userInfo.id }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(error.message);
        return;
      }

      socket.emit('leave_group', { code: groupCode, id: userInfo.id });
      setGroupCode('');
      setGroupMembers([]);
      setGroupName('');
      setIsInLobby(false);
      navigate('/DashboardPage');
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const isLeader = groupMembers.some(member => member.id === userInfo.id && member.role === 1);

  const handleReadRules = () => {
    if (isLeader) {
      setHasReadRules(true);
      // Sauvegarder dans localStorage
      localStorage.setItem(`hasReadRules_${groupCode}`, 'true');
    }
    navigate('/rules');
  };

  const handleGroupNameChange = async () => {
    try {
      const response = await fetch('/api/groups/update-name', {
        method: 'POST',
        headers: { 'Contcent-Type': 'application/json' },
        body: JSON.stringify({ code: groupCode, name: newGroupName, id: userInfo.id }),
      });
      if (response.ok) {
        socket.emit('change_group_name', { code: groupCode, name: newGroupName });
        setGroupName(newGroupName);
        setNewGroupName('');
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error changing group name:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleGroupNameChange();
    }
  };

  const handleLaunchParty = async () => {
    if (!hasReadRules) {
      alert("Vous devez d'abord lire les règles avant de lancer la partie !");
      return;
    }

    try {
      const newStartTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Appel API pour mettre à jour le start_time
      const response = await fetch('/api/groups/updateStartTime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupCode : groupCode , startTime: newStartTime }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur API:", errorData.message);
        alert("Une erreur est survenue lors du lancement de la partie.");
        return;
      }

      resetGame();
      launchGame(newStartTime);
      nextStep();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du start_time :", error);
      alert("Une erreur inattendue est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">
        Il faut sauver le <br /> BDE MMI
      </h1>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-white items-center justify-center gap-2">
          Nom de l&apos;équipe : {' '}
          {isEditing ? (
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="p-1 text-sm bg-gray-800 border border-primary rounded-lg text-white"
              placeholder="Nouveau nom du groupe"
            />
          ) : (
            <>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-primary">{groupName}</span>
                {isLeader && <FaEdit onClick={() => setIsEditing(true)} className="cursor-pointer text-primary" />}
              </div>
            </>
          )}
        </h2>
        <h2 className="text-lg font-semibold mt-2">
          Code : <span className="text-primary font-bold">{groupCode}</span>
        </h2>
      </div>

      <div className="space-y-4 w-full max-w-sm">
        {groupMembers.map((member, index) => (
          <PlayerCard
            key={index}
            avatarSrc={member.profil_picture}
            playerName={member.username}
            userId={member.id}
            leader={member.role}
            adepte={member.adepte}
          />
        ))}
      </div>

      {isLeader ? (
        <Button
          onClick={handleLaunchParty}
          className="w-full"
          disabled={isButtonDisabled}
        >
          Lancer la partie
        </Button>
      ) : (
        <p className="text-lg font-semibold text-center text-primary">
          Attendez que le leader lance la partie
        </p>
      )}

      <Button
        onClick={handleReadRules}
        className="w-full mt-4"
      >
        Lire les règles
      </Button>

      <Button
        variant={"outline"}
        onClick={handleLeaveGroup}
        className="w-full"
      >
        Quitter
      </Button>
    </div>
  );
};

export default LobbyPage;