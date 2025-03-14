const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const MemoryStore = session.MemoryStore;
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware CORS et Sessions
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://g4s5d.22.gremmi.fr',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://g4s5d.22.gremmi.fr');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore(),
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore(),
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Gestion des fichiers publics
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}
app.use('/public', express.static(publicDir));
app.use(express.json()); // Middleware pour le JSON

// Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);

const PORT = process.env.PORT || 3402;
server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// Importation du WebSocket dans un serveur séparé
require('./socket');