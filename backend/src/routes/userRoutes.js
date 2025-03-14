const express = require('express');
const upload = require('../middlewares/upload');
const {
    getAllUsers,
    getUserByUsername,
    updateUsername,
    updatePassword,
    updateProfilePicture,
} = require('../controllers/userController');

const router = express.Router();

// Route pour récupérer tous les utilisateurs
router.get('/', getAllUsers);

// Route pour récupérer un utilisateur par pseudo (username)
router.get('/:username', getUserByUsername);

// Route pour mettre à jour le pseudo
router.put('/update-username/:id', updateUsername);

// Route pour mettre à jour le mot de passe
router.put('/update-password/:id', updatePassword);

// Route pour mettre à jour la photo de profil
router.put('/update-profile-picture/:username', upload.single('profil_picture'), updateProfilePicture);

module.exports = router;
