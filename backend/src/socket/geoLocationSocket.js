module.exports = (io, socket, groups) => {
  if (!groups.validatedPlayers) {
    groups.validatedPlayers = new Map();
  }
  if (!groups.attempts) {
    groups.attempts = new Map();
  }

  function getValidatedPlayers(groupCode) {
    return groups.validatedPlayers.get(groupCode) || [];
  }

  function setValidatedPlayers(groupCode, players) {
    groups.validatedPlayers.set(groupCode, players);
  }

  function getAttempts(groupCode) {
    return groups.attempts.get(groupCode) || 0;
  }

  function incrementAttempts(groupCode) {
    const currentAttempts = getAttempts(groupCode);
    const newAttempts = currentAttempts + 1;
    groups.attempts.set(groupCode, newAttempts);


    io.to(groupCode).emit("attempts_updated", {
      attempts: newAttempts,
    });

    return newAttempts;
  }

  socket.on("join_challenge", ({ groupCode }) => {
    socket.join(groupCode);
    const currentAttempts = getAttempts(groupCode);
    socket.emit("attempts_updated", { attempts: currentAttempts });
  });

  socket.on(
    "challenge_attempt",
    ({ groupCode, challenge, attempt, playerId }) => {
      if (challenge === 4) {
        const { position, targetPosition } = attempt;

        const validatedPlayers = getValidatedPlayers(groupCode);
        const isAlreadyValidated = validatedPlayers.some(
          (p) => p.id === playerId
        );

        // Don't increment if player is already validated
        if (!isAlreadyValidated) {
          // Increment attempts BEFORE checking distance
          incrementAttempts(groupCode);
        }

        const distance = Math.sqrt(
          Math.pow(targetPosition.lat - position.lat, 2) +
            Math.pow(targetPosition.lng - position.lng, 2)
        );

        const distanceThreshold = 0.0001;

        if (distance <= distanceThreshold) {
          if (!isAlreadyValidated) {
            validatedPlayers.push({
              id: playerId,
              name: attempt.playerName,
            });
            setValidatedPlayers(groupCode, validatedPlayers);

            io.to(groupCode).emit("position_validated", {
              validatedPlayers,
            });

            io.to(groupCode).emit("challenge_attempt_response", {
              success: true,
              playerId,
              message: "Position validée !",
            });
          }
        } else {
          io.to(groupCode).emit("challenge_attempt_response", {
            success: false,
            playerId,
            message: "Vous êtes trop loin de la cible.",
          });
        }
      }
    }
  );
};
