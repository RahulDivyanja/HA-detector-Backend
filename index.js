const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
require("dotenv").config();
const { Expo } = require("expo-server-sdk");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());

let expo = new Expo(); // Expo push notification client
let pushTokens = []; // Store registered Expo push tokens

// Store connected clients
const clients = {};

// Endpoint to receive data from ESP32
app.post("/api/data", (req, res) => {
  const { pulseRate, oxygenLevel, motion } = req.body;
  console.log("Received data:", { pulseRate, oxygenLevel, motion });

  // Emit data to clients
  io.emit("data", { pulseRate, oxygenLevel, motion });

  // Detect emergency
  if (
    pulseRate < 60 ||
    pulseRate > 100 ||
    oxygenLevel < 90 

  ) {
    console.log("Emergency detected!");
    sendPushNotifications(
      "🚨 Emergency Alert!",
      "Abnormal health readings detected!"
    );
   
  }
  else if (motion === false) {
    sendPushNotifications("⚠ Warning!", "Sudden fall detected!");
  }
  res.status(200).send("Data received");
});

// Real-time communication with WebSocket
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);
  clients[socket.id] = socket;

  socket.on("disconnect", () => {
    delete clients[socket.id];
    console.log("A client disconnected:", socket.id);
  });
});

// Endpoint to receive and store Expo push tokens
app.post("/api/save-token", (req, res) => {
  const { expoPushToken } = req.body;

  if (!expoPushToken || !Expo.isExpoPushToken(expoPushToken)) {
    return res.status(400).json({ error: "Invalid Expo push token" });
  }

  if (!pushTokens.includes(expoPushToken)) {
    pushTokens.push(expoPushToken);
  }

  console.log("Saved Push Tokens:", pushTokens);
  res.status(200).json({ success: true, message: "Token saved successfully" });
});

// Function to send push notifications
function sendPushNotifications(title, body) {
  let messages = pushTokens.map((token) => ({
    to: token,
    sound: "defaultCritical", // Other options include 'default', 'defaultCritical', 'defaultCritical.aiff', etc.
    title,
    body,
    data: { alertType: "emergency" },
  }));

  let chunks = expo.chunkPushNotifications(messages);

  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("Push Notification Response:", ticketChunk);
      } catch (error) {
        console.error("Error sending push notification:", error);
      }
    }
  })();
}

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
