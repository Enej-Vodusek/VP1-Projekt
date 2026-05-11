const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CsvDataSchema = new Schema({
    age: { type: Number, required: false },
    gender: { type: String, required: false },
    education_level: { type: String, required: false },
    employment_status: { type: String, required: false },
    daily_screen_time_hours: { type: Number, required: false},
    sleep_hours: { type: Number, required: false },
    physical_activity_hrs: { type: Number, required: false },
    social_support_score: { type: Number, required: false },
    financial_stress: { type: Number, required: false },
    work_stress: { type: Number, required: false },
    anxiety_score: { type: Number, required: false },
    depression_score: { type: Number, required: false },
    stress_level: { type: Number, required: false }
});

module.exports = mongoose.model('csvData', CsvDataSchema);