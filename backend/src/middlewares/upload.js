const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Chemin du dossier "public"
const publicDir = path.join(__dirname, '..', '..', 'public');

// Configuration du stockage avec multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { username } = req.params; // Récupérer le username depuis les paramètres de l'URL

        if (!username) {
            return cb(new Error('Nom d\'utilisateur manquant dans la requête'));
        }

        // Chemin du dossier spécifique à l'utilisateur
        const userDir = path.join(publicDir, username);

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        cb(null, userDir); // Dossier cible
    },
    filename: (req, file, cb) => {
        // Enregistrer le fichier avec son nom d'origine
        cb(null, file.originalname);
    },
});

// Initialiser multer avec la configuration
const upload = multer({ storage });

module.exports = upload;
