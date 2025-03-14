import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLobby } from "../contexts/LobbyContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import TextInputWithButton from "../components/ui/TextInputWithButton.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import { socket } from "../socket";
import Button from "../components/ui/Button.jsx";

const DashboardPage = () => {
  const [teamName, setTeamName] = useState("");
  const [groupCodeInput, setGroupCodeInput] = useState("");
  const { setIsInLobby, setGroupCode } = useLobby();
  const navigate = useNavigate();
  const { userInfo, setIsAuthenticated ,updateUserInfo  } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  const handleCreateGroup = async () => {
    if (!teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }

    try {
      const response = await fetch("/api/groups/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, userId: userInfo.id }),
      });

      if (response.ok) {
        const { group } = await response.json();
        setGroupCode(group.code);
        setIsInLobby(true);
        socket.emit("create_group", {
          code: group.code,
          username: userInfo.username,
          id: userInfo.id,
          name: teamName,
          profil_picture: userInfo.profil_picture,
        });
        navigate("/LobbyPage");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.log("Error creating group:", error);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCodeInput.trim()) {
      alert("Please enter a group code.");
      return;
    }

    try {
      const response = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: groupCodeInput, userId: userInfo.id }),
      });

      if (response.ok) {
        const { group } = await response.json();
        setGroupCode(group.code);
        setIsInLobby(true);
        socket.emit("join_group", {
          code: group.code,
          username: userInfo.username,
          id: userInfo.id,
          profil_picture: userInfo.profil_picture,
        });
        navigate("/LobbyPage");
      } else {
        alert("Failed to join group. Please check the code.");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Réinitialiser le contexte d'authentification
        setIsAuthenticated(false);
        navigate("/");
      } else {
        alert("Erreur lors de la déconnexion");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const handleUpdateProfilePicture = async (e) => {
    e.preventDefault();

    if (!newProfilePicture) {
      setErrorMessage("Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("profil_picture", newProfilePicture);

    try {
      const response = await fetch(`/api/users/update-profile-picture/${userInfo.username}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.error || "Erreur lors de la mise à jour de la photo de profil");
        return;
      }

      const data = await response.json();
      setMessage("Photo de profil mise à jour avec succès!");
      setErrorMessage("");
      updateUserInfo({ profil_picture: data.user.profil_picture }); // Mise à jour du contexte
    } catch (err) {
      setErrorMessage("Erreur lors de la mise à jour de la photo de profil");
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      setErrorMessage("Le pseudo ne peut pas être vide.");
      return;
    }

    try {
      const response = await fetch(`/api/users/update-username/${userInfo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername }),
      });

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage(error.error || "Erreur lors de la mise à jour du pseudo");
        return;
      }

      const data = await response.json();
      setMessage(data.message);
      setErrorMessage("");
      updateUserInfo({ username: newUsername }); // Mise à jour du contexte
    } catch (err) {
      setErrorMessage("Erreur lors de la mise à jour du pseudo");
    }
  };
  const handleCloseModal = (e) => {
    if (e.target.id === "modal-backdrop") {
      setShowModal(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary">
        Il faut sauver le <br /> BDE MMI
      </h1>
      <div className="flex flex-col items-center" >
        <Avatar src={userInfo.profil_picture} name={userInfo.username} size="lg"   />
        <p className="text-lg font-semibold mt-2">{userInfo.username}</p>
      </div>
      <Button
          onClick={() => setShowModal(true)}
          variant="outline"
          size="lg"
          className="w-full "
      > modifier le profil
      </Button>
      <TextInputWithButton
        type="number"
        placeholder="Code de l'équipe"
        buttonText="Rejoindre"
        onClick={handleJoinGroup}
        onChange={(e) => setGroupCodeInput(e.target.value)}
        className="w-full"
      />
      <TextInputWithButton
        type="text"
        placeholder="Nom de l'équipe"
        buttonText="Créer"
        onClick={handleCreateGroup}
        onChange={(e) => setTeamName(e.target.value)}
        className="w-full"
      />
      <Button
          onClick={handleLogout}
          variant="outline"
          size="lg"
          className="w-full "
      >
        Se déconnecter
      </Button>
      {showModal && (
          <div
              id="modal-backdrop"
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70"
              onClick={handleCloseModal}
          >
            <div className="bg-gray-800 text-white w-full max-w-md p-6 rounded-lg space-y-6 shadow-lg">
              <h2 className="text-2xl font-bold text-primary text-center">
                Modifier le profil
              </h2>
              <div className="space-y-4">
                <TextInputWithButton
                    type="text"
                    placeholder="Entrez un nouveau pseudo"
                    buttonText="Enregistrer le pseudo"
                    onClick={handleUpdateUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full max-w-md mx-auto  items-stretch sm:items-center"
                />
              </div>
              <form className="space-y-4" onSubmit={handleUpdateProfilePicture}>
                <div className="space-y-2">
                  <label
                      htmlFor="profile-picture"
                      className="block text-sm font-medium text-gray-300"
                  >
                    Photo de profil
                  </label>
                  <div className="relative">
                    {/* Input file caché */}
                    <input
                        id="profile-picture"
                        type="file"
                        onChange={(e) => setNewProfilePicture(e.target.files[0])}
                        className="hidden"
                    />
                    {/* Bouton pour déclencher l'input */}
                    <Button
                        variant="default"
                        size="lg"
                        className="w-full text-black"
                        onClick={() => document.getElementById("profile-picture").click()}
                    >
                      Sélectionner une photo
                    </Button>
                  </div>
                </div>

                {/* Bouton pour soumettre le formulaire */}
                <Button
                    onClick={handleUpdateProfilePicture}
                    variant="outline"
                    size="lg"
                    className="w-full"
                >
                  Enregistrer la photo
                </Button>
              </form>

              {message && <p className="text-sm text-green-500">{message}</p>}
              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
            </div>
          </div>
      )}

    </div>
  );
};

export default DashboardPage;