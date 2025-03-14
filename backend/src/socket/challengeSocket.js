module.exports = (io, socket, groups) => {

    socket.on("join_challenge", (data) => {
        const { groupCode, id, username, profil_picture } = data;

        if (!groups[groupCode]) {
            socket.emit("error", { message: "Group does not exist." });
            return;
        }

        const existingMember = groups[groupCode].members.find((m) => m.id === id);
        if (existingMember) {
            existingMember.socketId = socket.id;
        } else {
            groups[groupCode].members.push({ socketId: socket.id, id, username, role: 0, profil_picture, adepte: null });
        }

        socket.join(groupCode);

        const elapsedTime = Math.floor((Date.now() - new Date(groups[groupCode].startTime)) / 1000);
        const baseMoney = 60000;
        const updatedMoney = Math.max(baseMoney - elapsedTime - (groups[groupCode].cumulativeDeductions || 0), 0);

        socket.emit("initial_state", { updatedMoney });
    });

    socket.on("leave_challenge", (groupCode) => {
        socket.leave(`geoLocation_${groupCode}`);
    });

    socket.on("qr_code_scanned", ({ groupCode }) => {
        if(groups[groupCode]) {
            io.to(groupCode).emit("qr_code_scanned");
        }
    })

    socket.on("apply_penalty", ({ groupCode, penaltyAmount }) => {


        if (!groups[groupCode]) {
            console.error("Group does not exist:", groupCode);
            io.to(groupCode).emit("error", { message: "Group does not exist." });
            return;
        }

        groups[groupCode].deductedMoneyTotal =
            (groups[groupCode].deductedMoneyTotal || 0) + penaltyAmount;

        const elapsedTime = Math.floor((Date.now() - new Date(groups[groupCode].startTime)) / 1000);
        const baseMoney = 60000;
        const updatedMoney = Math.max(baseMoney - elapsedTime - groups[groupCode].cumulativeDeductions, 0);

        groups[groupCode].money = updatedMoney;

        io.to(groupCode).emit("money_updated", { updatedMoney });
    });

    socket.on("start_game", ({ groupCode, startTime }) => {
        if (groups[groupCode]) {
            groups[groupCode].startTime = startTime;
            groups[groupCode].cumulativeDeductions = 0;
            groups[groupCode].money = 60000;

            io.to(groupCode).emit("game_started", { startTime });
        }
    });

    socket.on("reset_game", ({ groupCode }) => {
        if (groups[groupCode]) {
            groups[groupCode].startTime = new Date().toISOString();
            groups[groupCode].cumulativeDeductions = 0;
            groups[groupCode].money = 60000;

            io.to(groupCode).emit("reset_game");
        }
    });

    socket.on("challenge_attempt", ({groupCode, challenge, attempt }) => {
        if(groups[groupCode]) {
            io.to(groupCode).emit("challenge_attempt", { challenge, attempt });
        }
    });

    socket.on("update_key", ({ groupCode, updatedCurrentKey }) => {
        if(groups[groupCode]) {
            io.to(groupCode).emit("update_key", { updatedCurrentKey })
        }
    })

    socket.on('sync_completed_challenges', ({ groupCode, challenges }) => {
        io.to(groupCode).emit('sync_completed_challenges', challenges);
    });

    socket.on("hint_used", ({ groupCode, hintId, cost }) => {

        if (!groupCode || !hintId) {
            return;
        }

        io.to(groupCode).emit("hint_used_sync", { hintId, cost });
    });

    socket.on("end_game_success", ({ groupCode }) => {
        io.to(groupCode).emit("end_game_trigger");
    });

    socket.on('game_completed', ({ groupCode }) => {
        // Notify all clients in the group
        io.to(groupCode).emit('game_completed');
    });

    socket.on("add_key_socket", ({ groupCode, key }) => {
        if(groups[groupCode]) {
            groups[groupCode].key = key;
            io.to(groupCode).emit("full_key", { key });
        }
    });

    socket.on("request_key", ({ groupCode }) => {
        if(groups[groupCode]) {
            io.to(groupCode).emit("full_key", { key: groups[groupCode].key });
        }
    });
};