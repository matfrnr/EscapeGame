const db = require('../database');
const fs = require('fs');
const path = require('path');

const bcrypt = require('bcryptjs');

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
    try {
        const users = await db('users').select('id', 'username', 'password', 'profil_picture');

        // Parcourir les utilisateurs et s'assurer qu'une image par défaut est assignée si nécessaire
        const usersWithDefaultImage = users.map(user => {
            if (!user.profil_picture) {
                user.profil_picture = 'default.jpg';
            }
            return user;
        });

        res.json(usersWithDefaultImage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Récupérer un utilisateur par son pseudo (username)
const getUserByUsername = async (req, res) => {
    const { username } = req.params; // Récupérer le pseudo de l'URL

    try {
        const user = await db('users').where({ username }).first(); // Trouver l'utilisateur par pseudo

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Vérifier l'image de profil et en affecter une valeur par défaut si nécessaire
        if (!user.profil_picture) {
            user.profil_picture = 'default.jpg';
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
const updateUsername = async (req, res) => {
    const { id } = req.params;
    const { newUsername } = req.body;

    try {
        const existingUser = await db('users').where({ username: newUsername }).first();

        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const updatedUser = await db('users').where({ id }).update({ username: newUsername });

        if (updatedUser === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Mise à jour du pseudo dans la session
        req.session.user.username = newUsername;

        res.json({ message: 'Username updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update username' });
    }
};
const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        // Récupérer l'utilisateur par son ID
        const user = await db('users').where({ id }).first();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Vérifier que le mot de passe actuel est correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe dans la base de données
        await db('users').where({ id }).update({ password: hashedPassword });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
};
// Mise à jour de la photo de profil
const updateProfilePicture = async (req, res) => {
    const { username } = req.params;
    const uploadedFile = req.file;

    // Vérifier que l'utilisateur est connecté
    if (!req.session.user || req.session.user.username !== username) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await db('users').where({ username }).first();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Si un fichier a été téléchargé, construire le nouveau chemin de la photo de profil
        const newProfilPicturePath = uploadedFile ? `/api/public/${username}/${uploadedFile.filename}` : null;

        // Mettre à jour la photo de profil dans la base de données
        await db('users').where({ username }).update({ profil_picture: newProfilPicturePath });

        // Mettre à jour la session de l'utilisateur si nécessaire
        req.session.user.profil_picture = newProfilPicturePath;


        res.json({
            message: 'Profile picture updated successfully',
            user: {
                id: user.id,
                username: user.username,
                profil_picture: newProfilPicturePath,  // Le nouveau chemin de la photo de profil
            },
        });
    } catch (error) {
        console.error("Error during profile picture update:", error);
        res.status(500).json({ error: 'Failed to update profile picture' });
    }
};

module.exports = { getAllUsers, getUserByUsername, updateUsername,updatePassword , updateProfilePicture  };
