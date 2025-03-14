import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLobby } from "../contexts/LobbyContext";
import { useAuth } from "../contexts/AuthContext.jsx";
import { socket } from "../socket";

const ChatPage = () => {
  const { code } = useParams();
  const { groupCode, groupMembers, groupName } = useLobby(); // Utilisation de groupMembers
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const chatContainerRef = useRef(null); // Pour le défilement automatique

  useEffect(() => {
    if (code !== groupCode) {
      navigate("/");
      return;
    }

    socket.emit("join_chat", { code, id: userInfo.id, username: userInfo.username });

    socket.on("load_messages", (loadedMessages) => {
      setMessages(loadedMessages);
    });

    const handleMessageReceive = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom(); // Défilement automatique
    };

    socket.on("chat_message", handleMessageReceive);

    return () => {
      socket.off("chat_message", handleMessageReceive);
      socket.off("load_messages");
    };
  }, [code, groupCode, navigate, userInfo]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("chat_message", {
        code,
        message: newMessage,
        username: userInfo.username,
      });
      setNewMessage("");
    }
  };

  // Fonction pour récupérer la photo de profil depuis groupMembers
  const getProfilePicture = (username) => {
    const member = groupMembers.find((m) => m.username === username);
    return member?.profil_picture || "/default-avatar.png"; // Image par défaut
  };

  // Fonction pour scroller automatiquement vers le bas
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center text-primary mb-4">
        Chat de {groupName}
      </h1>

      {/* Conteneur du chat prenant tout l'espace disponible */}
      <div className="flex flex-col w-full max-w-4xl bg-bacground p-4 rounded-lg flex-grow h-[calc(100vh-150px)]">
        {/* Zone des messages avec défilement automatique */}
        <div
          ref={chatContainerRef}
          className="flex flex-col flex-grow overflow-y-auto space-y-4 p-2"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end space-x-2 ${
                msg.username === userInfo.username ? "justify-end" : "justify-start"
              }`}
            >
              {/* Photo de profil uniquement pour les messages reçus */}
              {msg.username !== userInfo.username && (
                  <div>
                <img
                  src={getProfilePicture(msg.username)}
                  alt={msg.username}
                  className="w-10 h-10 rounded-full border border-gray-500"
                />
                    <span className="text-xs text-white/40">{msg.username}</span>
                  </div>
              )}

              {/* Bulle de message stylisée */}
              <div
                className={`p-3 rounded-2xl text-white max-w-sm ${
                  msg.username === userInfo.username
                    ? "bg-blue-500 text-right"
                    : "bg-gray-700 text-left"
                }`}
              >
                 {/*<p className="text-sm font-semibold">{msg.username}</p>*/}
                <p>{msg.message}</p>
                {/*<span className="text-xs opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</span>*/}
              </div>
            </div>
          ))}
        </div>

        {/* Zone d'entrée du message */}
        <div className="flex space-x-2 pt-4 fixed bottom-0 left-0 w-full bg-background p-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
            placeholder="Tapez votre message..."
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-primary text-white rounded-lg"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;