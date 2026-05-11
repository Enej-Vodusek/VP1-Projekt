/*import fs from "fs";
import csv from "csv-parser";

const results = [];

fs.createReadStream("./data/anxiety_depression_data.csv")
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {
    console.log("CSV successfully processed!");

    // shrani kot JSON
    fs.writeFileSync(
      "./data/output.json",
      JSON.stringify(results, null, 2)
    );

    // shrani kot txt
    fs.writeFileSync(
      "./data/output.txt",
      results.map((r) => JSON.stringify(r)).join("\n")
    );

    console.log("Data saved!");
  });*/

import fs from "fs";
import axios from "axios";
import csv from "csv-parser";

const CSV_URL =
  "https://huggingface.co/datasets/jason1966/ak0212_anxiety-and-depression-mental-health-factors/resolve/main/anxiety_depression_data.csv";

const downloadCSV = async () => {
  const response = await axios({
    method: "GET",
    url: CSV_URL,
    responseType: "stream",
  });

  const writer = fs.createWriteStream("./scripts/dataProcessing/data/anxiety_depression_data.csv");

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const parseCSV = async () => {
  const results = [];

  fs.createReadStream("./scripts/dataProcessing/data/anxiety_depression_data.csv")
    .pipe(csv())
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      console.log("CSV parsed!");

      fs.writeFileSync(
        "./scripts/dataProcessing/data/output.json",
        JSON.stringify(results, null, 2)
      );

      console.log("JSON saved!");
      console.log(`Records: ${results.length}`);
    });
};

const run = async () => {
  try {
    console.log("Downloading CSV...");

    await downloadCSV();

    console.log("CSV downloaded!");

    await parseCSV();
  } catch (error) {
    console.error(error);
  }
};

run();