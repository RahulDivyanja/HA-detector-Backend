const pushService = require("../services/pushService");

exports.postData = (req, res, io) => {
  const { pulseRate, oxygenLevel, motion } = req.body;
  console.log("Received data:", { pulseRate, oxygenLevel, motion });

  // Emit data to clients
  io.emit("data", { pulseRate, oxygenLevel, motion });

  // Detect emergency
  if (pulseRate < 60 || pulseRate > 100 || oxygenLevel < 90) {
    console.log("Emergency detected!");
    pushService.sendPushNotifications(
      "🚨 Emergency Alert!",
      "Abnormal health readings detected!"
    );
  } else if (motion === true) {
    pushService.sendPushNotifications("⚠ Warning!", "Sudden fall detected!");
  }

  res.status(200).send("Data received");
};
