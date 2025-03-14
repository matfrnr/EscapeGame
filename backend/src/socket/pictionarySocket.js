module.exports = (io, socket, groups) => {
  // Synchronisation du dessin
  socket.on("drawing_data", (data) => {
    const { groupCode, data: drawingData } = data;
    if (groups[groupCode]) {
      socket.to(groupCode).emit("drawing_data", drawingData);
    }
  });

  // Réinitialisation du canvas pour tout le monde
  socket.on("reset_canvas", (data) => {
    const { groupCode } = data;
    if (groups[groupCode]) {
      io.to(groupCode).emit("reset_canvas");
    }
  });

  // Soumission du mot par le non-adepte
  socket.on("submit_guess", (data) => {
    const { groupCode, guess, word } = data;
    if (groups[groupCode]) {
      if (guess === word) {
        io.to(groupCode).emit("guess_result", { result: true });
      } else {
        io.to(groupCode).emit("guess_result", { result: false });
      }
    }
  });

  // Envoi du mot pour l'adepte
  socket.on("start_challenge", (data) => {
    const { groupCode, word } = data;
    if (groups[groupCode]) {
      io.to(groupCode).emit("new_word", { word });
    }
  });
};