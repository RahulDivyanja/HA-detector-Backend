const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(bodyParser.json());
app.use(cors());

// Firebase Admin Initialization
const serviceAccount = require('C:\\Users\\Acer\\Desktop\\HA Backend\\heart-attack-detector-a1965-firebase-adminsdk-f28kh-bb431639a3.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Store connected clients
const clients = {};



// Endpoint to receive data from ESP32
app.post('/api/data', (req, res) => {
  const { pulseRate, oxygenLevel, motion } = req.body;
  console.log(req.body);
  console.log('Received data:', { pulseRate, oxygenLevel, motion});

  // Emit data to clients
  io.emit('data', { pulseRate, oxygenLevel, motion });
  //Detect emergency
  if(pulseRate < 60 || pulseRate > 100 || oxygenLevel < 90 || motion === false){
    console.log('Emergency detected!');
    sendNotification('Emergency Alert!', 'An emergency notification from ESP32!');
    emergency = true;
  }

  res.status(200).send('Data received');
});

// Real-time communication with WebSocket
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  clients[socket.id] = socket;

  socket.on('disconnect', () => {
    delete clients[socket.id];
    console.log('A client disconnected:', socket.id);
  });
});

// Function to send notifications
function sendNotification(title, body) {
  const message = {
    notification: { title, body },
    topic: 'emergency-alerts',
  };

  admin
    .messaging()
    .send(message)
    .then((response) => console.log('Notification sent successfully:', response))
    .catch((error) => console.error('Error sending notification:', error));
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
