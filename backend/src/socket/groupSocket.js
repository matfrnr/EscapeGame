module.exports = (io, socket, groups) => {
  socket.on("create_group", (data) => {
    const { code, username, id, name, profil_picture } = data;

    if (!groups[code]) {
      groups[code] = {
        name,
        members: [
          {
            socketId: socket.id,
            id,
            username,
            role: 1,
            profil_picture,
            adepte: null,
          },
        ],
      };
    }
    socket.join(code);
    io.in(code).emit("group_info", groups[code]);
  });

  socket.on("join_group", (data) => {
    const { code, id, username, profil_picture } = data;

    if (!groups[code]) {
      socket.emit("error", { message: "Group does not exist." });
      return;
    }

    const existingMember = groups[code].members.find((m) => m.id === id);

    if (existingMember) {
      existingMember.socketId = socket.id;
    } else {
      groups[code].members.push({
        socketId: socket.id,
        id,
        username,
        role: 0,
        profil_picture,
        adepte: null,
      });
    }

    socket.join(code);
    io.in(code).emit("group_info", groups[code]);
  });

  socket.on("question_answered", (data) => {
    const { groupCode, questionIndex, isCorrect } = data;
    if (groups[groupCode]) {
      io.in(groupCode).emit("question_answered", { questionIndex, isCorrect });
    }
  });

  socket.on("leave_group", (data) => {
    const { code, id } = data;

    if (groups[code]) {
      groups[code].members = groups[code].members.filter((m) => m.id !== id);

      if (groups[code].members.length === 0) {
        delete groups[code];
      } else if (groups[code].members[0]) {
        groups[code].members[0].role = 1;
      }

      io.in(code).emit("group_info", groups[code]);
    }
  });

  socket.on("change_group_name", (data) => {
    const { code, name } = data;

    if (groups[code]) {
      groups[code].name = name;
      io.in(code).emit("group_info", groups[code]);
    }
  });

  socket.on("get_group_info", (data) => {
    const { code } = data;
    if (groups[code]) {
      socket.emit("group_info", groups[code]);
    } else {
      socket.emit("error", { message: "Group not found." });
    }
  });

  socket.on("challenge_success", ({ groupCode, challenge }) => {
    if (groups[groupCode]) {
      io.in(groupCode).emit("challenge_success", { challenge });
    }
  });

  // Dans votre fichier de configuration socket côté serveur
  socket.on("error_challenge", ({ groupCode }) => {
    socket.to(groupCode).emit("show_error_modal");
  });

  socket.on("success_challenge", ({ groupCode }) => {
    socket.to(groupCode).emit("show_success_modal");
  });

  socket.on("addAdepte", (data) => {
    const { code, userId, adepte } = data;

    if (groups[code]) {
      const member = groups[code].members.find((m) => m.id === userId);
      if (member) {
        member.adepte = adepte;
        io.in(code).emit("group_info", groups[code]);
      } else {
        socket.emit("error", { message: "Member not found." });
      }
    } else {
      socket.emit("error", { message: "Group not found." });
    }
  });

  socket.on("deleteAdepte", (data) => {
    const { code, userId } = data;

    if (groups[code]) {
      const member = groups[code].members.find((m) => m.id === userId);
      if (member) {
        member.adepte = null;
        io.in(code).emit("group_info", groups[code]);
      } else {
        socket.emit("error", { message: "Member not found." });
      }
    } else {
      socket.emit("error", { message: "Group not found." });
    }
  });

  socket.on("next_step", (data) => {
    const { groupCode, newStep } = data;

    if (groups[groupCode]) {
      groups[groupCode].currentStep = newStep;
      io.in(groupCode).emit("update_step", newStep); // Diffusion à tout le groupe
    } else {
      socket.emit("error", { message: "Group not found." });
    }
  });
};
