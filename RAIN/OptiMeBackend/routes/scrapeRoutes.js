const express = require("express");

const router = express.Router();

const {
  scrapeData,
  getSavedData,
} = require("../controllers/scrapeController");

router.get("/scrape", scrapeData);

router.get("/scripts/dataProcessing/data", getSavedData);

module.exports = router;