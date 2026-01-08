const { Expo } = require("expo-server-sdk");
const expo = new Expo();

let pushTokens = [];

function isExpoPushToken(token) {
  try {
    return Expo.isExpoPushToken(token);
  } catch (e) {
    return false;
  }
}

function saveToken(token) {
  if (!token || !isExpoPushToken(token)) return false;
  if (!pushTokens.includes(token)) pushTokens.push(token);
  return true;
}

function getTokens() {
  return pushTokens;
}

async function sendPushNotifications(title, body) {
  if (!pushTokens.length) return;

  const messages = pushTokens.map((token) => ({
    to: token,
    sound: "defaultCritical",
    title,
    body,
    data: { alertType: "emergency" },
  }));

  const chunks = expo.chunkPushNotifications(messages);

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push Notification Response:", ticketChunk);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
}

module.exports = {
  isExpoPushToken,
  saveToken,
  getTokens,
  sendPushNotifications,
};
