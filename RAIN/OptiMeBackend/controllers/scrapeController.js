const fs = require("fs");

const {
  scrapeMentalHealthData,
} = require("../services/scraperService");

const scrapeData = async (req, res) => {
  try {
    console.log("Starting scrape...");

    const results = await scrapeMentalHealthData();

    res.status(200).json({
      success: true,
      message: "Data scraped successfully",
      totalRecords: results.length,
      preview: results.slice(0, 5),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Scraping failed",
      error: error.message,
    });
  }
};

const getSavedData = async (req, res) => {
  try {
    const rawData = fs.readFileSync(
      "./scripts/dataProcessing/data/output.json",
      "utf-8"
    );

    const data = JSON.parse(rawData);

    res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "No saved data found",
    });
  }
};

module.exports = {
  scrapeData,
  getSavedData,
};