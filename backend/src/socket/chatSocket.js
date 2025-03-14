const setupChatSocket = (io, socket, groups) => {

  // Rejoindre uniquement le chat
  socket.on("join_chat", (data) => {
    const { code, id, username, profil_picture } = data;

    if (!groups[code]) {
      socket.emit("error", { message: "Group not found." });
      return;
    }

    socket.join(code);

    // Envoyer l'historique des messages uniquement pour le chat
    socket.emit("load_messages", groups[code].chat || []);
  });

  socket.on("chat_message", (data) => {
    const { code, message, username } = data;

    if (!groups[code]) {
      socket.emit("error", { message: "Group not found." });
      return;
    }

    // Créer un tableau de chat s'il n'existe pas
    if (!groups[code].chat) {
      groups[code].chat = [];
    }

    // Limitation à 50 messages
    if (groups[code].chat.length >= 50) {
      groups[code].chat.shift(); // Supprimer le message le plus ancien
    }

    const newMessage = {
      id: Date.now(),
      message,
      username,
      timestamp: new Date().toISOString(),
    };

    groups[code].chat.push(newMessage);
    io.to(code).emit("chat_message", newMessage);
  });
};

module.exports = setupChatSocket;