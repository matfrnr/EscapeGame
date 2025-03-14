module.exports = (io, socket, groups) => {
    if (!groups.wordsGrid) {
        groups.wordsGrid = new Map();
    }
    if (!groups.adepteId) {
        groups.adepteId = new Map();
    }

    const generateWordGrid = () => {
        const allWords = [
            "Jacquot", "Traître", "Ami", "Ennemi", "Loyal", "Courage",
            "Tricheur", "Espion", "Fidèle", "Honnête", "Ruse",
            "Stratégie", "Trahison", "Alliance", "Secret", "Défi",
        ];
        return allWords.sort(() => 0.5 - Math.random()).slice(0, 16);
    };

    socket.on("join_challenge", ({ groupCode, id, groupMembers }) => {

        if (!groupMembers || groupMembers.length === 0) {
            return;
        }

        socket.join(groupCode);

        if (!groups.wordsGrid.has(groupCode)) {
            const words = generateWordGrid();
            groups.wordsGrid.set(groupCode, words);
        }

        if (!groups.adepteId.has(groupCode)) {
            const adepte = groupMembers.find((member) => member.adepte === "Guéraud-Pinet");
            if (adepte) {
                groups.adepteId.set(groupCode, adepte.id);
            } else {
                console.log(`⚠️ Aucun adepte trouvé pour le groupe ${groupCode}`);
            }
        }

        const words = groups.wordsGrid.get(groupCode);
        const adepteId = groups.adepteId.get(groupCode);
        const isAdepte = id === adepteId;

        const enrichedWords = words.map((word) => ({
            word,
            isCorrect: false,
        }));

        socket.emit("update_grid", {
            words: enrichedWords,
        });
    });

    socket.on("challenge_attempt", ({ groupCode, words }) => {
        io.to(groupCode).emit("challenge_attempt_response", {
            success: true,
            message: "Challenge attempt received.",
        });
    });

    socket.on("send_message", ({ groupCode, message }) => {
        io.to(groupCode).emit("receive_message", { message });
    });

    socket.on("disconnect", () => {
        console.log(`❌ WebSocket déconnecté : ${socket.id}`);
    });
};