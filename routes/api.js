const express = require("express");
const sensorController = require("../controllers/sensorController");
const tokenController = require("../controllers/tokenController");

module.exports = (io) => {
  const router = express.Router();

  router.post("/data", (req, res) => sensorController.postData(req, res, io));
  router.post("/save-token", tokenController.saveToken);

  return router;
};
