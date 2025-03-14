import { io } from 'socket.io-client';

//Version de production
//const socketURL = 'wss://g4s5d.22.gremmi.fr'

//Version de développement
const socketURL = 'http://localhost:3401'

// Connexion au namespace racine `/`
export const socket = io(socketURL, {
  withCredentials: true,
  transports: ['websocket']
});

// Écouter la connexion réussie
socket.on('connect', () => {
  console.log('✅ Connecté au WebSocket avec succès ! ID:', socket.id);;
});