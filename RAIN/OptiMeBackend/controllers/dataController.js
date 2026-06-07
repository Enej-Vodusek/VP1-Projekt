var SnapshotModel = require("../models/userSnapshotModel");
var User = require("../models/userModel");

const DAYS_TO_SHOW = 7;
const DAILY_STEP_GOAL = 8000;

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function getStepGoalProgress(steps) {
  if (typeof steps !== "number" || Number.isNaN(steps)) {
    return null;
  }

  return Math.min(100, Math.round((steps / DAILY_STEP_GOAL) * 100));
}

function getDateKey(date) {
  const parsedDate = new Date(date);

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildDateWindow() {
  const today = startOfDay(new Date());
  const firstDay = addDays(today, -(DAYS_TO_SHOW - 1));

  return Array.from({ length: DAYS_TO_SHOW }, (_, index) => {
    const date = addDays(firstDay, index);

    return {
      date,
      dateKey: getDateKey(date),
    };
  });
}

async function getDashboardDays(userId) {
  const dateWindow = buildDateWindow();

  const firstDate = dateWindow[0].date;
  const lastDate = dateWindow[dateWindow.length - 1].date;
  const endDate = addDays(lastDate, 1);

  const snapshots = await SnapshotModel.find({
    userId,
    date: {
      $gte: firstDate,
      $lt: endDate,
    },
  }).sort({ date: 1 });

  const snapshotMap = new Map();

  snapshots.forEach((snapshot) => {
    snapshotMap.set(getDateKey(snapshot.date), snapshot);
  });

  return dateWindow.map((day) => {
    const snapshot = snapshotMap.get(day.dateKey) || null;

    return {
      date: day.date,
      dateKey: day.dateKey,
      snapshot,
      hasData: !!snapshot,
    };
  });
}

function getDates(days) {
  return days.map((day) => day.dateKey);
}

function getHasDataByDate(days) {
  return days.map((day) => day.hasData);
}

function getNumber(day, field, fallback = null) {
  const value = day?.snapshot?.[field];

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  return fallback;
}

function getSocialConnection(day) {
  const value =
    getNumber(day, "socialConnection", null) ??
    getNumber(day, "socialization", null) ??
    getNumber(day, "socialScore", null);

  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  return null;
}

function buildArray(days, field) {
  return days.map((day) => {
    if (!day.hasData) {
      return null;
    }

    return getNumber(day, field, null);
  });
}

function buildSocialArray(days) {
  return days.map((day) => {
    if (!day.hasData) {
      return null;
    }

    return getSocialConnection(day);
  });
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getPositiveScore(day, field) {
  if (!day.hasData) {
    return null;
  }

  const value = getNumber(day, field, null);

  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return clampScore(value * 20);
}

function getInvertedScore(day, field) {
  if (!day.hasData) {
    return null;
  }

  const value = getNumber(day, field, null);

  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return clampScore((6 - value) * 20);
}

function average(arr) {
  const numericValues = arr.filter(
    (value) => typeof value === "number" && !Number.isNaN(value),
  );

  if (!numericValues.length) {
    return null;
  }

  return Math.round(
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length,
  );
}

function calculateTrend(
  current,
  previous,
  higherIsGood = true,
  maxPercent = 100,
) {
  if (
    typeof current !== "number" ||
    typeof previous !== "number" ||
    Number.isNaN(current) ||
    Number.isNaN(previous) ||
    previous <= 0
  ) {
    return {
      direction: "same",
      value: 0,
      isGood: true,
    };
  }

  const diff = current - previous;
  const rawPercent = Math.abs(Math.round((diff / previous) * 100));
  const percent = Math.min(rawPercent, maxPercent);

  return {
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "same",
    value: percent,
    isGood: higherIsGood ? diff >= 0 : diff <= 0,
  };
}

function getStatus(score) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return {
      level: "No data",
      status: "warning",
    };
  }

  if (score >= 70) {
    return {
      level: "Healthy",
      status: "healthy",
    };
  }

  if (score >= 40) {
    return {
      level: "Moderate",
      status: "warning",
    };
  }

  return {
    level: "High",
    status: "danger",
  };
}

function getMentalHealthLabel(score) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "No data";
  }

  if (score >= 75) {
    return "Healthy";
  }

  if (score >= 40) {
    return "Moderate";
  }

  return "High Risk";
}

function getMentalHealthStatus(score) {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "warning";
  }

  if (score >= 75) {
    return "healthy";
  }

  if (score >= 40) {
    return "warning";
  }

  return "danger";
}

function calculateMentalHealthScore(day) {
  if (!day.hasData) {
    return null;
  }

  return weightedAverage([
    {
      score: getPositiveScore(day, "mood"),
      weight: 0.22,
    },
    {
      score: getInvertedScore(day, "stress"),
      weight: 0.18,
    },
    {
      score: getInvertedScore(day, "anxiety"),
      weight: 0.18,
    },
    {
      score: getSleepScore(day),
      weight: 0.15,
    },
    {
      score: getSocialScore(day),
      weight: 0.1,
    },
    {
      score: getStepsScore(day),
      weight: 0.12,
    },
    {
      score: getScreenTimeScore(day),
      weight: 0.05,
    },
  ]);
}

function multiplyOrNull(value, multiplier) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.round(value * multiplier);
}

function weightedAverage(items) {
  const validItems = items.filter(
    (item) =>
      typeof item.score === "number" &&
      !Number.isNaN(item.score) &&
      typeof item.weight === "number" &&
      item.weight > 0,
  );

  if (!validItems.length) {
    return null;
  }

  const weightedSum = validItems.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);

  return Math.round(weightedSum / totalWeight);
}

function getSleepScore(day) {
  const sleepHours = getNumber(day, "sleepHours", null);

  if (typeof sleepHours !== "number" || Number.isNaN(sleepHours)) {
    return null;
  }

  // Idealno: 7-9h = 100
  if (sleepHours >= 7 && sleepHours <= 9) {
    return 100;
  }

  // Malo premalo / preveč
  if (sleepHours >= 6 && sleepHours < 7) {
    return 80;
  }

  if (sleepHours > 9 && sleepHours <= 10) {
    return 80;
  }

  // Slabše
  if (sleepHours >= 5 && sleepHours < 6) {
    return 60;
  }

  if (sleepHours > 10 && sleepHours <= 11) {
    return 60;
  }

  if (sleepHours >= 4 && sleepHours < 5) {
    return 40;
  }

  return 20;
}

function getStepsScore(day) {
  const steps = getNumber(day, "steps", null);

  if (typeof steps !== "number" || Number.isNaN(steps)) {
    return null;
  }

  // 8000+ korakov = 100
  return clampScore((steps / DAILY_STEP_GOAL) * 100);
}

function getScreenTimeScore(day) {
  const screenTimeHours = getNumber(day, "screenTimeHours", null);

  if (typeof screenTimeHours !== "number" || Number.isNaN(screenTimeHours)) {
    return null;
  }

  // Manj screen time = boljše.
  // 0h = 100, 8h+ = 0
  return clampScore(100 - (screenTimeHours / 8) * 100);
}

function getSocialScore(day) {
  const socialConnection = getSocialConnection(day);

  if (typeof socialConnection !== "number" || Number.isNaN(socialConnection)) {
    return null;
  }

  return clampScore(socialConnection * 20);
}

exports.mentalHealthData = async function (req, res) {
  try {
    const days = await getDashboardDays(req.user.userId);

    const currentDay =
      [...days].reverse().find((day) => day.hasData) || days[days.length - 1];

    const currentDayIndex = days.findIndex(
      (day) => day.dateKey === currentDay.dateKey,
    );

    const previousDay =
      currentDayIndex > 0 ? days[currentDayIndex - 1] : currentDay;

    const currentScore = calculateMentalHealthScore(currentDay);
    const previousScore = calculateMentalHealthScore(previousDay);

    const hasCurrentScore = typeof currentScore === "number";
    const hasPreviousScore = typeof previousScore === "number";

    const mentalHealthScore = {
      value: hasCurrentScore ? currentScore : null,
      label: getMentalHealthLabel(currentScore),
      status: getMentalHealthStatus(currentScore),
      changeFromLastWeek:
        hasCurrentScore && hasPreviousScore
          ? currentScore - previousScore
          : null,
      date: currentDay.dateKey,
    };

    return res.json({
      success: true,
      message: "Mental health score retrieval successful",
      dates: getDates(days),
      hasDataByDate: getHasDataByDate(days),
      mentalHealthScore,
    });
  } catch (err) {
    console.log("Mental health score error:", err);

    return res.status(500).json({
      success: false,
      message: "Mental health score retrieval failed",
      error: err.message,
    });
  }
};

exports.trackedMetricsData = async function (req, res) {
  try {
    const days = await getDashboardDays(req.user.userId);

    const dates = getDates(days);
    const today = days[days.length - 1];
    const previousDay = days[days.length - 2] || today;

    const sleepArray = buildArray(days, "sleepHours");
    const activityArray = buildArray(days, "steps");
    const screenTimeArray = buildArray(days, "screenTimeHours");
    const socialArray = buildSocialArray(days);
    const moodArray = buildArray(days, "mood");
    const stressArray = buildArray(days, "stress");

    const trackedMetrics = [
      {
        id: "sleep",
        title: "Sleep",
        value: getNumber(today, "sleepHours", null),
        suffix: "h",
        subtitle: "Sleep hours",
        trend: calculateTrend(
          getNumber(today, "sleepHours", null),
          getNumber(previousDay, "sleepHours", null),
          true,
        ),
        chart: sleepArray,
        dates,
      },
      {
        id: "activity",
        title: "Activity",
        value: getNumber(today, "steps", null),
        maxValue: DAILY_STEP_GOAL,
        goal: DAILY_STEP_GOAL,
        progress: getStepGoalProgress(getNumber(today, "steps", null)),
        lastSyncedAt: today?.snapshot?.lastPedometerSyncAt || null,
        subtitle: "Steps from pedometer",
        trend: calculateTrend(
          getNumber(today, "steps", null),
          getNumber(previousDay, "steps", null),
          true,
          100,
        ),
        chart: activityArray,
        dates,
      },
      {
        id: "screen-time",
        title: "Screen Time",
        value: getNumber(today, "screenTimeHours", null),
        suffix: "h",
        subtitle: "Device screen time",
        trend: calculateTrend(
          getNumber(today, "screenTimeHours", null),
          getNumber(previousDay, "screenTimeHours", null),
          false,
        ),
        chart: screenTimeArray,
        dates,
      },
      {
        id: "socialization",
        title: "Socialization",
        value: getSocialConnection(today),
        suffix: "/5",
        subtitle: "Social connection",
        trend: calculateTrend(
          getSocialConnection(today),
          getSocialConnection(previousDay),
          true,
        ),
        chart: socialArray,
        dates,
      },
      {
        id: "mood",
        title: "Mood",
        value: getNumber(today, "mood", null),
        suffix: "/5",
        subtitle: "Mood check-in",
        trend: calculateTrend(
          getNumber(today, "mood", null),
          getNumber(previousDay, "mood", null),
          true,
        ),
        chart: moodArray,
        dates,
      },
      {
        id: "stress",
        title: "Stress",
        value: getNumber(today, "stress", null),
        suffix: "/5",
        subtitle: "Baseline stress level",
        trend: calculateTrend(
          getNumber(today, "stress", null),
          getNumber(previousDay, "stress", null),
          false,
        ),
        chart: stressArray,
        dates,
      },
    ];

    return res.json({
      success: true,
      message: "Tracked metrics data retrieval successful",
      dates,
      hasDataByDate: getHasDataByDate(days),
      trackedMetrics,
    });
  } catch (err) {
    console.log("Tracked metrics error:", err);

    return res.status(500).json({
      success: false,
      message: "Tracked metrics retrieval failed",
      error: err.message,
    });
  }
};

exports.calculatedScoresData = async function (req, res) {
  try {
    const days = await getDashboardDays(req.user.userId);

    const dates = getDates(days);

    const anxietyChart = days.map((day) => getInvertedScore(day, "anxiety"));
    const stressChart = days.map((day) => getInvertedScore(day, "stress"));
    const moodChart = days.map((day) => getPositiveScore(day, "mood"));

    const anxietyValue = average(anxietyChart);
    const stressValue = average(stressChart);
    const moodValue = average(moodChart);

    const anxietyStatus = getStatus(anxietyValue);
    const stressStatus = getStatus(stressValue);
    const moodStatus = getStatus(moodValue);

    const calculatedScores = [
      {
        id: "anxiety-signals",
        title: "Anxiety Signals",
        value: anxietyValue,
        suffix: "/100",
        subtitle: "Based on recent patterns",
        level: anxietyStatus.level,
        status: anxietyStatus.status,
        chart: anxietyChart,
        dates,
      },
      {
        id: "stress-level",
        title: "Stress Level",
        value: stressStatus.level,
        subtitle: "Work, school and daily pressure",
        level: stressStatus.level,
        status: stressStatus.status,
        chart: stressChart,
        dates,
      },
      {
        id: "mood-balance",
        title: "Mood Balance",
        value: moodValue,
        suffix: "/100",
        subtitle: "Mood, sleep and social signals",
        level: moodStatus.level,
        status: moodStatus.status,
        chart: moodChart,
        dates,
      },
    ];

    return res.json({
      success: true,
      message: "Calculated scores retrieval successful",
      dates,
      hasDataByDate: getHasDataByDate(days),
      calculatedScores,
    });
  } catch (err) {
    console.log("Calculated scores error:", err);

    return res.status(500).json({
      success: false,
      message: "Calculated scores retrieval failed",
      error: err.message,
    });
  }
};

exports.trendsData = async function (req, res) {
  try {
    const days = await getDashboardDays(req.user.userId);

    const dates = getDates(days);

    const sleepArray = buildArray(days, "sleepHours");
    const socialArray = buildSocialArray(days);
    const activityArray = buildArray(days, "steps");
    const screenTimeArray = buildArray(days, "screenTimeHours");
    const stressArray = buildArray(days, "stress");

    const trends = [
      {
        id: "sleep",
        label: "Sleep (hrs)",
        data: sleepArray,
        dates,
      },
      {
        id: "movement",
        label: "Movement (steps)",
        data: activityArray,
        dates,
      },
      {
        id: "social-score",
        label: "Social Score",
        data: socialArray.map((value) => multiplyOrNull(value, 20)),
        dates,
      },
      {
        id: "stress-level",
        label: "Stress Level",
        data: stressArray.map((value) => multiplyOrNull(value, 20)),
        dates,
      },
      {
        id: "screen-time",
        label: "Screen Time (hrs)",
        data: screenTimeArray.map((value) => multiplyOrNull(value, 10)),
        dates,
      },
    ];

    return res.json({
      success: true,
      message: "Trends retrieval successful",
      dates,
      hasDataByDate: getHasDataByDate(days),
      trends,
    });
  } catch (err) {
    console.log("Trends error:", err);

    return res.status(500).json({
      success: false,
      message: "Trends retrieval failed",
      error: err.message,
    });
  }
};

exports.submitUserSnapshot = async function (req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User with your ID not found",
      });
    }

    const { date, sleepHours, screenTimeHours, mood, stress, anxiety } =
      req.body;

    const missingFields = [];

    if (sleepHours === undefined) missingFields.push("sleepHours");
    if (screenTimeHours === undefined) missingFields.push("screenTimeHours");
    if (mood === undefined) missingFields.push("mood");
    if (stress === undefined) missingFields.push("stress");
    if (anxiety === undefined) missingFields.push("anxiety");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required snapshot data",
        missingFields,
      });
    }

    const snapshotDate = date ? new Date(date) : new Date();

    if (Number.isNaN(snapshotDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid snapshot date",
      });
    }

    snapshotDate.setHours(0, 0, 0, 0);

    const numericValues = {
      sleepHours: Number(sleepHours),
      screenTimeHours: Number(screenTimeHours),
      mood: Number(mood),
      stress: Number(stress),
      anxiety: Number(anxiety),
    };

    const invalidFields = Object.entries(numericValues)
      .filter(([, value]) => Number.isNaN(value))
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Snapshot fields must be valid numbers",
        invalidFields,
      });
    }

    await SnapshotModel.updateOne(
      {
        userId,
        date: snapshotDate,
      },
      {
        $set: {
          userId,
          date: snapshotDate,
          sleepHours: numericValues.sleepHours,
          screenTimeHours: numericValues.screenTimeHours,
          mood: numericValues.mood,
          stress: numericValues.stress,
          anxiety: numericValues.anxiety,
        },
      },
      {
        upsert: true,
      },
    );

    const snapshot = await SnapshotModel.findOne({
      userId,
      date: snapshotDate,
    });

    return res.status(200).json({
      success: true,
      message: "Snapshot saved successfully",
      snapshot,
    });
  } catch (err) {
    console.error("submitUserSnapshot error:", err);

    return res.status(500).json({
      success: false,
      message: "Snapshot saving failed",
      error: err.message,
    });
  }
};
