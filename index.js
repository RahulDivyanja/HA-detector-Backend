const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

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

// Register API routes (passes `io` to routes that need it)
const apiRoutes = require("./routes/api")(io);
app.use("/api", apiRoutes);

// Real-time communication with WebSocket
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A client disconnected:", socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
