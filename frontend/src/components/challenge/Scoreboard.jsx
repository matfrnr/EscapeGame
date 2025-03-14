import AvatarGroup from "../ui/AvatarGroup.jsx";
import Avatar from "../ui/Avatar.jsx";
import Title from "../ui/Title.jsx";
import { useEffect, useState } from "react";
import { useLobby } from "../../contexts/LobbyContext.jsx";
import axios from "axios";

export default function Scoreboard() {
    const [sort, setSort] = useState("time");
    const { groupName } = useLobby();
    const [teams, setTeams] = useState([]);
    const score = 20000;

    useEffect(() => {
        async function getTeams() {
            try {
                const res = await axios.get("/api/groups/completed-teams");
                setTeams(res.data.data); // Met à jour le state avec les données de l'API
            } catch (error) {
                console.log("error", error);
            }
        }

        getTeams();
    }, []);

    // Trier les équipes par score en ordre décroissant
    const teamsBasedOnScore = [...teams].sort((a, b) => {
        if (a.score < b.score) return 1; // Trier en ordre décroissant
        if (a.score > b.score) return -1;
        return 0;
    });

    return (
        <div className="p-3">
            {groupName && (
                <div>
                    <AvatarGroup groupName={groupName}>
                        <Avatar src="https://i.pravatar.cc/40" name="Nom1" size="md" />
                        <Avatar src="https://i.pravatar.cc/40" name="Nom2" size="md" />
                        <Avatar src="https://i.pravatar.cc/40" name="Nom3" size="md" />
                    </AvatarGroup>
                    <p>Votre score est de : {score}</p>
                </div>
            )}

            <Title className="text-center text-primary" level={1}>
                Classement
            </Title>
            <div className="flex flex-row items-center justify-center gap-4 my-4">
                <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="sort"
                        id="time"
                        value="time"
                        checked={sort === "time"}
                        onChange={() => setSort("time")}
                        className="hidden"
                    />
                    <label
                        htmlFor="time"
                        className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-colors text-center text-sm sm:text-base ${
                            sort === "time" ? "bg-primary text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                sort === "time" ? "border-white bg-white" : "border-gray-800"
                            }`}
                        >
                            {sort === "time" && (
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                            )}
                        </span>
                        Trier par temps
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        name="sort"
                        id="score"
                        value="score"
                        checked={sort === "score"}
                        onChange={() => setSort("score")}
                        className="hidden"
                    />
                    <label
                        htmlFor="score"
                        className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg transition-colors text-center text-sm sm:text-base ${
                            sort === "score" ? "bg-primary text-white" : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                sort === "score" ? "border-white bg-white" : "border-gray-800"
                            }`}
                        >
                            {sort === "score" && (
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                            )}
                        </span>
                        Trier par score
                    </label>
                </div>
            </div>

            <div className="bg-neutral-700 p-3 rounded-lg space-y-2">
                {sort === "time" &&
                    teams.map((team, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 shadow border-gray-300 rounded-lg bg-neutral-800"
                        >
                            <AvatarGroup groupName={team.name}>
                                {team.members.map((member, index) => (
                                    <Avatar
                                        key={index}
                                        src={member.profil_picture}
                                        name={member.name}
                                        size="sm"
                                    />
                                ))}
                            </AvatarGroup>
                            <div>
                                <p>Score : {team.score}</p>
                                <p>Fini en : {team.finishTime}</p>
                            </div>
                        </div>
                    ))}

                {sort === "score" &&
                    teamsBasedOnScore.map((team, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 shadow border-gray-300 rounded-lg bg-neutral-800"
                        >
                            <AvatarGroup groupName={team.name}>
                                {team.members.map((member, index) => (
                                    <Avatar
                                        key={index}
                                        src={member.profil_picture}
                                        name={member.name}
                                        size="sm"
                                    />
                                ))}
                            </AvatarGroup>
                            <div>
                                <p>Score : {team.score}</p>
                                <p>Fini en : {team.finishTime}</p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}