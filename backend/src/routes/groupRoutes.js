const express = require('express');
const { createGroup, joinGroup, leaveGroup, updateGroupName, getAdeptes, addAdepte, deleteAdepte,updateScore, updateStartTime
    ,updateEndTime } = require('../controllers/groupController');
const { getCompletedTeams } = require('../controllers/teamController');
const router = express.Router();

// Route pour créer un groupe
router.post('/create', createGroup);

// Route pour rejoindre un groupe
router.post('/join', joinGroup);

// Route pour quitter un groupe
router.post('/leave', leaveGroup);

//Route pour modifier le nom du group
router.post('/update-name', updateGroupName);

//Route pour récupérer les adeptes
router.post('/getAdepte', getAdeptes);

//Route pour ajouter un adepte
router.post('/addAdepte', addAdepte);

//Route pour supprimer un adepte
router.post('/deleteAdepte', deleteAdepte);

router.post('/updateScore',updateScore)
router.post('/updateStartTime',updateStartTime)
router.post('/updateEndTime',updateEndTime)

// Route pour récupérer les équipes ayant terminé le jeu
router.get('/completed-teams', getCompletedTeams);

module.exports = router;