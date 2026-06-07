const express = require('express');
const router = express.Router();
const controller = require('../controllers/dataController');
const authMiddleware = require("../middleware/authMiddleware");

router.get('/mentalHealthScore', authMiddleware, controller.mentalHealthData);
router.get('/trackedMetrics', authMiddleware, controller.trackedMetricsData);
router.get('/calculatedScores', authMiddleware, controller.calculatedScoresData);
router.get('/trends', authMiddleware, controller.trendsData);
router.post('/submitUserSnapshot', authMiddleware, controller.submitUserSnapshot);

module.exports = router;