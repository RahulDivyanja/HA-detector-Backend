const pushService = require("../services/pushService");

exports.saveToken = (req, res) => {
  const { expoPushToken } = req.body;

  if (!expoPushToken || !pushService.isExpoPushToken(expoPushToken)) {
    return res.status(400).json({ error: "Invalid Expo push token" });
  }

  pushService.saveToken(expoPushToken);

  console.log("Saved Push Tokens:", pushService.getTokens());
  res.status(200).json({ success: true, message: "Token saved successfully" });
};
