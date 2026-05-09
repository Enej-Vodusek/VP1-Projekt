const fs = require('fs');
const csv = require('csv-parser');
const Stream = require('stream');
const UserSnapshot = require('../models/userSnapshotModel');
const UserStData = require('../models/userStDataModel');
const mongoose = require('mongoose');

const columns = ['date', 'daily_total_hours'];

function pick(row) {
  const normalized = normalizeRow(row);

  return Object.fromEntries(
    columns
      .filter(col => normalized[col] !== undefined) 
      .map(col => [col, normalized[col]]) 
       
  );
}

function normalizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key.toLowerCase(),
      value
    ])
  );
}

async function processImport(docs) {

  return new Promise((resolve, reject) => {

    let totalTime = 0;

    fs.createReadStream(docs.storagePath)
      .pipe(csv())

      .on('data', (row) => {

        const pickedRow = pick(row);

        if (pickedRow.date === "2026-04-07") {
          totalTime += parseFloat(pickedRow.daily_total_hours);
        }

      })

      .on('end', async () => {

        try {

          await UserSnapshot.updateOne(
            {
              userId: docs.userId,
              date: new Date(docs.importedForDate)
            },
            {
              $set: {
                screenTimeHours: totalTime
              }
            },
            { upsert: true } //if no doc create it
          );

          resolve();

        } catch (err) {

          reject(err);

        }

      });

  });
}

async function run() {

  await mongoose.connect('mongodb://zigalebic02:jp8bQs3yA1FSR0sH@ac-rxpanwp-shard-00-00.yjssyxx.mongodb.net:27017,ac-rxpanwp-shard-00-01.yjssyxx.mongodb.net:27017,ac-rxpanwp-shard-00-02.yjssyxx.mongodb.net:27017/OptiMe?ssl=true&replicaSet=atlas-822hpm-shard-0&authSource=admin&appName=OptiMe');

  const userStDataDocs = await UserStData.find({ isProcessed: false });

  for (const stDatadocs of userStDataDocs) {
    await processImport(stDatadocs);
    await UserStData.updateOne(
      {
         _id: stDatadocs._id
      },
      {
         $set: { isProcessed: true } 
      }
    ); 
  }

  await mongoose.disconnect();

  console.log("All imports processed");
}

run();