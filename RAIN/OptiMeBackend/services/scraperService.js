const fs = require("fs");
const axios = require("axios");
const csv = require("csv-parser");

const CSV_URL = "https://huggingface.co/datasets/jason1966/ak0212_anxiety-and-depression-mental-health-factors/resolve/main/anxiety_depression_data.csv";

const downloadCSV = async () => {
  const response = await axios({
    method: "GET",
    url: CSV_URL,
    responseType: "stream",
  });

  // create data folder if it doesn't exist
  if (!fs.existsSync("./scripts/dataProcessing/data")) {
    fs.mkdirSync("./scripts/dataProcessing/data");
  }

  const writer = fs.createWriteStream(
    "./scripts/dataProcessing/data/anxiety_depression_data.csv"
  );

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const parseCSV = async () => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream("./scripts/dataProcessing/data/anxiety_depression_data.csv")
      .pipe(csv())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const scrapeMentalHealthData = async () => {
  await downloadCSV();

  const results = await parseCSV();

  // save JSON
  fs.writeFileSync(
    "./scripts/dataProcessing/data/output.json",
    JSON.stringify(results, null, 2)
  );

  return results;
};

module.exports = {
  scrapeMentalHealthData,
};