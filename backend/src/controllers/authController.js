const bcrypt = require('bcryptjs');
const db = require('../database');
const path = require('path');
const fs = require('fs');

// Inscription
const register = async (req, res) => {
    const { username } = req.params;
    const { password } = req.body;

    const uploadedFile = req.file;

    try {
        const existingUser = await db('users').where({ username }).first();
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profilPicturePath = uploadedFile ? `/api/public/${username}/${uploadedFile.filename}` : null;

        const newUser = {
            username,
            password: hashedPassword,
            profil_picture:profilPicturePath,
        };

        const [userId] = await db('users').insert(newUser);

        req.session.user = { id: userId, username, profil_picture: newUser.profil_picture };

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

// Connexion
const login = async (req, res) => {
    const { username, password } = req.body;


    try {
        const user = await db('users').where({ username }).first();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        req.session.user = user;


        res.json({
            message: 'Logged in successfully',
            user: {
                id: user.id,  // ID de l'utilisateur
                username: user.username,  // Pseudo
                profil_picture: user.profil_picture,  // Photo de profil
            }
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: 'Impossible de se connecter' });
    }
};

// Déconnexion
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
};

// Middleware pour vérifier si l'utilisateur est authentifié
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
};

module.exports = { register, login, logout, isAuthenticated };