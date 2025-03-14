import { useState, useEffect } from "react";
import Modal from "react-modal";
import Avatar from "./Avatar";
import Button from "./Button";
import { FaCrown } from "react-icons/fa";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { socket } from "../../socket";

Modal.setAppElement("#root"); // Assurez-vous que l'élément racine est défini

const ADEPTE_MESSAGES = {
  Jacquot: "Jacquot est un sépcialiste du linux et il est très séduisant",
  Tissier: "Je méritais plus que 12 pour ma peinture",
  default: "Pour faire plaisir au 4 en comm"
};

function PlayerCard({ avatarSrc, playerName, userId, leader, adepte }) {
  const { groupCode, setGroupMembers } = useLobby(); // Utilisez le contexte pour obtenir groupCode et groupMembers
  const { userInfo } = useAuth(); // Utilisez le contexte pour obtenir userInfo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adeptes, setAdeptes] = useState([]);

  const handleRoleSelect = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchAdeptes = async () => {
      try {
        const response = await fetch("/api/groups/getAdepte", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupCode })
        });
        if (response.ok) {
          const data = await response.json();
          setAdeptes(data);
        } else {
          console.error("Erreur lors de la récupération des adeptes:", response.statusText);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des adeptes:", error);
      }
    };

    if (isModalOpen) {
      fetchAdeptes();
    }
  }, [isModalOpen, groupCode]);

  const handleAdepteSelect = async (adepte) => {
    try {
      const response = await fetch("/api/groups/addAdepte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adepte, groupCode, userId: userInfo.id })
      });
      if (response.ok) {
        socket.emit("addAdepte", { code: groupCode, userId: userInfo.id, adepte: adepte });

        // Mettre à jour le contexte groupMembers
        setGroupMembers(prevMembers => prevMembers.map(member =>
          member.id === userInfo.id ? { ...member, adepte } : member
        ));

        closeModal();
      } else if (response.status === 409) {
        console.error("Erreur: L'adepte est déjà attribué à un autre membre.");
        alert("Erreur: L'adepte est déjà attribué à un autre membre.");
      } else {
        console.error("Erreur lors de l'ajout de l'adepte:", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'adepte:", error);
    }
  };

  const handleAdepteDelete = async () => {
    try {
      const response = await fetch("/api/groups/deleteAdepte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupCode, userId: userInfo.id })
      });
      if (response.ok) {
        socket.emit("deleteAdepte", { code: groupCode, userId: userInfo.id });

        // Mettre à jour le contexte groupMembers
        setGroupMembers(prevMembers => prevMembers.map(member =>
          member.id === userInfo.id ? { ...member, adepte: null } : member
        ));
      } else {
        console.error("Erreur lors de la suppression de l'adepte:", response.statusText);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'adepte:", error);
    }
  };

  return (
    <div className="flex w-full items-center gap-4 rounded-lg p-4"
         style={{ backgroundColor: userInfo.id === userId ? "rgba(224, 127, 81, 0.3)" : "transparent" }}>
      {/* Avatar */}
      <Avatar src={avatarSrc} name={playerName} size="lg" />

      {/* Player Name and Role */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <p className="text-xl font-bold text-white">{playerName}</p>
          {leader === 1 && <FaCrown className="ml-2 text-yellow-500" />}
        </div>

        {userId === userInfo.id ? (
          adepte ? (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-2xl font-bold text-red-500 cursor-pointer" onClick={handleAdepteDelete}>✗</span>
              <span className="font-bold text-green-500">{adepte}</span>
            </div>
          ) : (
            <Button
              onClick={handleRoleSelect}
              size="xs"
              variant="secoundary"
              className={userInfo.id === userId ? "bg-transparent border border-white mt-2" : "mt-2"}
            >
              Choisir sa voie
            </Button>
          )
        ) : (
          <span className="font-bold text-green-500">{adepte}</span>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Role Selection Modal"
        className="p-4 rounded-lg max-w-md mx-auto bg-background bg-opacity-25 border border-primary shadow-lg"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
      >
        <h2 className="text-2xl font-extrabold text-white text-center mb-4">Roles disponible</h2>
        <div className="space-y-2">
          {adeptes.map((adepte, index) => (
            <div
              key={index}
              className="p-4 bg-background rounded-lg cursor-pointer"
              onClick={() => handleAdepteSelect(adepte)}
            >
              <h3 className="text-lg font-extrabold text-primary">{adepte}</h3>
              <p className="text-white mt-1 text-xs">{ADEPTE_MESSAGES[adepte] || ADEPTE_MESSAGES.default}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <Button onClick={closeModal} className="bg-red-500 text-white py-2 px-4 rounded-lg">
            Fermer
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default PlayerCard;