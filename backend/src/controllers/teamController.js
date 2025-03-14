const db = require("../database");

const getCompletedTeams = async (req, res) => {
    try {

        // Requête SQL brute avec jointures pour récupérer les équipes et leurs membres
        const query = `
            SELECT 
                teams.id AS team_id,
                teams.name AS team_name,
                teams.score AS team_score,
                TIMESTAMPDIFF(SECOND, teams.start_time, teams.end_time) AS finish_time_seconds,
                users.username AS member_name,
                users.profil_picture AS member_picture
            FROM 
                teams
            JOIN 
                team_members ON teams.id = team_members.team_id
            JOIN 
                users ON team_members.user_id = users.id
            WHERE 
                teams.start_time IS NOT NULL 
                AND teams.end_time IS NOT NULL
            ORDER BY 
                teams.end_time ASC;
        `;

        // Exécution de la requête SQL
        const [rows] = await db.raw(query);


        // Regrouper les membres par équipe
        const teamsMap = {};
        rows.forEach(row => {
            if (!teamsMap[row.team_id]) {
                teamsMap[row.team_id] = {
                    name: row.team_name,
                    score: row.team_score,
                    finishTime: formatTime(row.finish_time_seconds), // Formater le temps écoulé
                    members: []
                };
            }
            teamsMap[row.team_id].members.push({
                name: row.member_name,
                profil_picture: row.member_picture || null // Gérer les profils nuls
            });
        });

        const teams = Object.values(teamsMap);

        res.status(200).json({
            success: true,
            data: teams,
        });
    } catch (error) {
        console.error("Error fetching completed teams:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching completed teams.",
        });
    }
};

// Fonction pour formater le temps écoulé en HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return [hours, minutes, remainingSeconds]
        .map(num => String(num).padStart(2, '0'))
        .join(':');
}

module.exports = {
    getCompletedTeams,
};