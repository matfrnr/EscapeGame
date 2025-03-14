const db = require("../database");
const { v4: uuidv4 } = require("uuid");

// Fonction pour générer un code de groupe unique
const generateGroupCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = Math.floor(1000 + Math.random() * 9000).toString(); // Code à 4 chiffres
    const existingGroup = await db("teams").where({ code }).first();
    if (!existingGroup) {
      isUnique = true;
    }
  }

  return code;
};

// Créer un groupe
const createGroup = async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ message: "Name and userId are required." });
    }

    // Vérifier si le nom de groupe existe déjà
    const existingGroup = await db("teams").where({ name }).first();
    if (existingGroup) {
      return res.status(409).json({ message: "Group name already exists." });
    }

    // Générer un code unique pour le groupe
    const code = await generateGroupCode();

    // Insérer le groupe dans la table `teams`
    const [groupId] = await db("teams").insert({ name, code }).returning("id");

    // Ajouter l'utilisateur comme membre du groupe avec le rôle de leader
    await db("team_members").insert({
      team_id: groupId,
      user_id: userId,
      role: 1 // 1 = leader
    });

    // Récupérer l'objet inséré
    const group = await db("teams").where({ id: groupId }).first();

    // Répondre avec le groupe créé
    res.status(201).json({ group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Failed to create group." });
  }
};

// Rejoindre un groupe
const joinGroup = async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ message: "Code and userId are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await db("team_members")
      .where({
        team_id: group.id,
        user_id: userId
      })
      .first();

    if (existingMember) {
      return res.status(400).json({ message: "User already in the group." });
    }

    // Ajouter l'utilisateur au groupe
    await db("team_members").insert({
      team_id: group.id,
      user_id: userId,
      role: 0 // 0 = membre
    });

    res.status(200).json({ message: "Joined group successfully.", group });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Failed to join group." });
  }
};

// Quitter un groupe
const leaveGroup = async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ message: "Code and userId are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Vérifier si l'utilisateur est membre du groupe
    const user = await db("team_members")
      .where({
        team_id: group.id,
        user_id: userId
      })
      .first();

    if (!user) {
      return res.status(400).json({ message: "User not in the group." });
    }

    let isLeader = false;
    if (user.role === "1") {
      isLeader = true;
    }

    // Supprimer l'utilisateur du groupe
    await db("team_members")
      .where({
        team_id: group.id,
        user_id: userId
      })
      .del();

    // Vérifier s'il reste des membres dans le groupe
    const remainingMembers = await db("team_members").where({ team_id: group.id });

    let newLeaderId = null;
    if (remainingMembers.length === 0) {
      await db("teams").where({ id: group.id }).del();
    } else if (isLeader) {
      newLeaderId = remainingMembers[0].user_id;
      await db("team_members")
        .where({ team_id: group.id, user_id: newLeaderId })
        .update({ role: 1 });
    }

    res.status(200).json({ message: "Left group successfully." });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Failed to leave group." });
  }
};

const updateGroupName = async (req, res) => {
  try {
    const { code, name, id } = req.body;

    if (!code || !name || !id) {
      return res.status(400).json({ message: "Code, newName, and userId are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    //Vérifier si le nom de groupe existe déjà
    const existingGroup = await db("teams").where({ name: name }).first();
    if (existingGroup) {
      return res.status(409).json({ message: "Group name already exists." });
    }

    // Vérifier si l'utilisateur est le leader du groupe
    const leader = await db("team_members")
      .where({
        team_id: group.id,
        user_id: id,
        role: 1 // 1 = leader
      })
      .first();

    if (!leader) {
      return res.status(403).json({ message: "Only the leader can rename the group." });
    }

    // Mettre à jour le nom dans la BDD
    await db("teams").where({ id: group.id }).update({ name: name });

    res.status(200).json({ message: "Group name updated successfully." });
  } catch (error) {
    console.error("Error updating group name:", error);
    res.status(500).json({ message: "Failed to update group name." });
  }
};

// Récupérer les adeptes disponibles
const getAdeptes = async (req, res) => {
  try {
    const { groupCode } = req.body;

    if (!groupCode) {
      return res.status(400).json({ message: "Group code is required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code: groupCode }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Récupérer les adeptes déjà présents dans l'équipe
    const existingAdeptes = await db("team_members")
      .where({ team_id: group.id })
      .pluck("adepte");

    // Liste des adeptes disponibles
    const allAdeptes = ["Jacquot", "Tissier", "Guéraud-Pinet"];
    const availableAdeptes = allAdeptes.filter(adepte => !existingAdeptes.includes(adepte));

    res.status(200).json(availableAdeptes);
  } catch (error) {
    console.error("Error fetching adeptes:", error);
    res.status(500).json({ message: "Failed to fetch adeptes." });
  }
};

// Ajouter un adepte à l'équipe
const addAdepte = async (req, res) => {
  try {
    const { adepte, groupCode, userId } = req.body;

    if (!adepte || !groupCode || !userId) {
      return res.status(400).json({ message: "Adepte, group code, and user ID are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code: groupCode }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Vérifier si l'utilisateur fait partie du groupe
    const member = await db("team_members").where({ team_id: group.id, user_id: userId }).first();
    if (!member) {
      return res.status(403).json({ message: "User is not a member of the group." });
    }

    // Vérifier si l'adepte est déjà attribué
    const existingAdepte = await db("team_members").where({ team_id: group.id, adepte }).first();
    if (existingAdepte) {
      return res.status(409).json({ message: "Adepte already assigned to another member." });
    }

    // Ajouter l'adepte à l'utilisateur dans le groupe
    await db("team_members")
      .where({ team_id: group.id, user_id: userId })
      .update({ adepte });

    res.status(200).json({ message: "Adepte added successfully." });
  } catch (error) {
    console.error("Error adding adepte:", error);
    res.status(500).json({ message: "Failed to add adepte." });
  }
};

// Supprimer un adepte de l'équipe
const deleteAdepte = async (req, res) => {
  try {
    const { groupCode, userId } = req.body;

    if (!groupCode || !userId) {
      return res.status(400).json({ message: "Group code and user ID are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code: groupCode }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Vérifier si l'utilisateur fait partie du groupe
    const member = await db("team_members").where({ team_id: group.id, user_id: userId }).first();
    if (!member) {
      return res.status(403).json({ message: "User is not a member of the group." });
    }

    // Supprimer l'adepte de l'utilisateur dans le groupe
    await db("team_members")
      .where({ team_id: group.id, user_id: userId })
      .update({ adepte: null });

    res.status(200).json({ message: "Adepte deleted successfully." });
  } catch (error) {
    console.error("Error deleting adepte:", error);
    res.status(500).json({ message: "Failed to delete adepte." });
  }
};
const updateScore = async (req, res) => {
  try {
    const { groupCode, score } = req.body;

    if (!groupCode || score === undefined) {
      return res.status(400).json({ message: "Group code and score are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code: groupCode }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Mettre à jour le score
    await db("teams").where({ code: groupCode }).update({ score });

    res.status(200).json({ message: "Score updated successfully." });
  } catch (error) {
    console.error("Error updating score:", error);
    res.status(500).json({ message: "Failed to update score." });
  }
};
const updateStartTime = async (req, res) => {
  try {
    const { groupCode, startTime } = req.body;
    if (!groupCode ) {
      return res.status(400).json({ message: "Group code  are required." });
    }
    if ( !startTime) {
      return res.status(400).json({ message: " startTime are required." });
    }


    // Vérifier si le groupe existe
    const group = await db("teams").where({ code: groupCode }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Mettre à jour l'heure de début
    await db("teams").where({ code: groupCode }).update({ start_time: startTime });

    res.status(200).json({ message: "Start time updated successfully." });
  } catch (error) {
    console.error("Error updating start time:", error);
    res.status(500).json({ message: "Failed to update start time." });
  }
};
const updateEndTime = async (req, res) => {
  try {
    const { groupCode, endTime } = req.body;

    if (!groupCode || !endTime) {
      return res.status(400).json({ message: "Group code and endTime are required." });
    }

    // Vérifier si le groupe existe
    const group = await db("teams").where({ code: groupCode }).first();
    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Mettre à jour l'heure de fin
    await db("teams").where({ code: groupCode }).update({ end_time: endTime });

    res.status(200).json({ message: "End time updated successfully." });
  } catch (error) {
    console.error("Error updating end time:", error);
    res.status(500).json({ message: "Failed to update end time." });
  }
};


module.exports = {
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroupName,
  getAdeptes,
  addAdepte,
  deleteAdepte,
  updateScore,
  updateStartTime
  ,updateEndTime
};