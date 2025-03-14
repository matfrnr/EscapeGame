const express = require('express');
const { register, login, logout, isAuthenticated } = require('../controllers/authController');
const upload = require('../middlewares/upload'); // Chemin vers le middleware upload.js

const router = express.Router();

// Route pour l'inscription
router.post('/register/:username', upload.single('profil_picture'), register);

// Route pour la connexion
router.post('/login', login);

// Route pour la déconnexion
router.post('/logout', logout);

// Exemple de route protégée nécessitant une authentification
router.get('/protected', isAuthenticated, (req, res) => {
    res.json({ message: 'You have access to this protected route', user: req.session.user });
});
router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({
            success: true,
            user: req.session.user,
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'No active session',
        });
    }
});

module.exports = router;