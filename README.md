# 🎮 EscapeGame - Jeu d'Évasion Multiplayer en Ligne

Une application web interactive d'escape game en temps réel avec des mini-jeux variés, un système de points, une géolocalisation et un chat multiplayer.

## ✨ Caractéristiques principales

- **🎯 Système de Défis Multiplayer** : 12 défis différents et variés
  - Défis de géolocalisation
  - Jeux de logique (Pictionary, CodeName, Échecs)
  - Challenges audio et visuels
  - Énigmes interactives

- **👥 Gestion d'Équipes**
  - Création et gestion d'équipes
  - Système de points et de classement
  - Tableau de bord en temps réel

- **💬 Chat en Temps Réel**
  - Communication instantanée entre équipes
  - Notifications de progression
  - Historique des messages

- **📍 Géolocalisation**
  - Défis basés sur la position GPS
  - Calcul de proximité en temps réel
  - Interface de cartographie

- **🔐 Authentification Sécurisée**
  - Inscription et connexion utilisateur
  - Gestion de profils
  - Sessions utilisateur

- **📱 Interface Responsive**
  - Design mobile-first
  - Compatible avec tous les appareils
  - Progressive Web App (PWA)

## 🛠️ Stack Technologique

### Frontend
- **React 18** : Framework UI
- **Vite** : Bundler haute performance
- **TailwindCSS** : Styling utility-first
- **React Router** : Navigation
- **Socket.io Client** : Communication temps réel
- **Axios** : Client HTTP
- **Lucide React** : Icônes

### Backend
- **Node.js + Express** : Serveur HTTP
- **Socket.io** : WebSocket pour le temps réel
- **MySQL** : Base de données
- **Knex.js** : Query builder et migrations
- **Bcryptjs** : Hachage des mots de passe
- **Multer** : Upload de fichiers
- **CORS** : Gestion des requêtes cross-origin

## 📋 Prérequis

- **Node.js** : v16+ 
- **npm** ou **yarn** : v8+
- **MySQL** : v5.7+ ou MariaDB
- **Git** : Pour le versioning

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <votre-repository-url>
cd EscapeGame
```

### 2. Configuration Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres MySQL
```

**Configuration du fichier `.env` :**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=escapegame
DB_PORT=3306
SESSION_SECRET=your_secret_key
PORT=3001
NODE_ENV=development
```

### 3. Configuration Frontend

```bash
cd ../frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec l'URL du serveur backend
```

**Configuration du fichier `.env` :**
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 4. Initialiser la Base de Données

```bash
cd backend

# Exécuter les migrations
npm run migrate

# Optionnel : charger les données de seed
npm run seed
```

## 🏃 Démarrage

### Mode développement

**Terminal 1 - Backend :**
```bash
cd backend
npm start
# Le serveur démarre sur http://localhost:3001
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
# L'application démarre sur http://localhost:5173
```

### Mode production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
NODE_ENV=production npm start
```

## 📁 Structure du Projet

```
EscapeGame/
├── backend/
│   ├── src/
│   │   ├── app.js              # Configuration Express
│   │   ├── database.js         # Configuration MySQL
│   │   ├── socket.js           # Configuration Socket.io
│   │   ├── controllers/        # Logique métier
│   │   ├── routes/             # Endpoints API
│   │   ├── middlewares/        # Middlewares Express
│   │   └── socket/             # Gestionnaires Socket.io
│   ├── migrations/             # Migrations Knex
│   ├── seeds/                  # Données de seed
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Composants React
│   │   │   ├── challenge/      # Mini-jeux
│   │   │   └── ui/             # Composants UI réutilisables
│   │   ├── pages/              # Pages de l'application
│   │   ├── contexts/           # Contextes React
│   │   ├── hooks/              # Hooks personnalisés
│   │   ├── utils/              # Utilitaires
│   │   └── assets/             # Images, audio, styles
│   ├── public/                 # Fichiers statiques
│   └── package.json
│
└── README.md
```

## 🎮 Utilisation

### Créer une Partie

1. Allez sur la page d'accueil
2. Inscrivez-vous ou connectez-vous
3. Créez une nouvelle équipe ou rejoignez une existante
4. Commencez les défis

### Défis Disponibles

| Numéro | Nom | Type | Description |
|--------|-----|------|-------------|
| 1-4 | Defis Basiques | Logique | Énigmes et devinettes |
| 5-7 | Jeux Interactifs | Temps réel | Pictionary, CodeName, Échecs |
| 8-9 | Géolocalisation | GPS | Défis basés sur votre position |
| 10-12 | Défis Spéciaux | Audio/Visuel | Challenges avancés |

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Utilisateurs
- `GET /api/users/:id` - Récupérer profil
- `PUT /api/users/:id` - Modifier profil
- `GET /api/users/:id/avatar` - Avatar utilisateur

### Équipes
- `POST /api/teams` - Créer équipe
- `GET /api/teams/:id` - Récupérer équipe
- `POST /api/teams/:id/members` - Ajouter membre
- `GET /api/teams/:id/leaderboard` - Classement

### Groupes de Défis
- `GET /api/groups` - Lister tous les groupes
- `GET /api/groups/:id` - Détails d'un groupe

## 🔌 Événements Socket.io

### Client → Server
- `challenge:start` - Démarrer un défi
- `challenge:submit` - Soumettre réponse
- `chat:message` - Envoyer message chat
- `geolocation:update` - Partager position GPS

### Server → Client
- `challenge:updated` - Mise à jour défi
- `team:score_updated` - Points actualisés
- `leaderboard:changed` - Classement modifié
- `chat:message_received` - Message reçu

## 🐛 Dépannage

### Connexion à la Base de Données
```
Erreur : "Connection refused"
- Vérifiez que MySQL est démarré
- Vérifiez les identifiants dans .env
- Vérifiez le port MySQL (défaut : 3306)
```

### Problèmes Socket.io
```
Erreur : "WebSocket connection failed"
- Vérifiez que le backend est démarré
- Vérifiez CORS_ORIGIN dans les variables d'environnement
- Vérifiez la console du navigateur pour les erreurs
```

### Géolocalisation ne fonctionne pas
```
- Vérifiez les permissions du navigateur
- Utilisez HTTPS en production
- Testez sur un appareil mobile avec GPS
```
