const User = require("../models/userModel");
const Auth = require("../services/auth");

// Register
exports.register = async function (req, res) {
  try {
    const { email, password, gender, dateOfBirth } = req.body;

    // Check required fields
    if (!email || !password || !gender || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check email
    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check valid date
    const parsedDate = new Date(dateOfBirth);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      gender,
      dateOfBirth: parsedDate,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: err.message,
    });
  }
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Check email format
    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    // DO NOT LEAK WHICH FIELD IS WRONG
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = Auth.createAccessToken(user);

    const refreshToken = Auth.createRefreshToken(user);

    await Auth.storeRefreshToken(user, refreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      accessToken,
      refreshToken,
      success: true,
      message: "User login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        education: user.education,
        employment: user.employment,
        mood: user.mood,
        sleepHours: user.sleepHours,
        activity: user.activity,
        socialConnection: user.socialConnection,
        phoneScreenTime: user.phoneScreenTime,
        stress: user.stress,
        formFinished: user.formFinished,
        twoFactorEnabled: user.twoFactorEnabled, //tukaj sem dodal 2fa
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: err.message,
    });
  }
};

exports.logout = async function (req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await Auth.revokeRefreshToken(refreshToken); //from DB
    }

    res.clearCookie("refreshToken"); //from local

    return res.status(201).json({
      success: true,
      message: "User logout successfull",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "logout Failed",
    });
  }
};

exports.saveForm = async function (req, res) {
  try {
    const user = await User.findOne({ _id: req.user.userId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User with your ID not found",
      });
    }

    const { username, education, employment, baseline } = req.body;

    const missingFields = [];

    if (!username || String(username).trim() === "") {
      missingFields.push("username");
    }

    if (!education) {
      missingFields.push("education");
    }

    if (!employment) {
      missingFields.push("employment");
    }

    if (!baseline || typeof baseline !== "object") {
      missingFields.push("baseline");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required form data",
        missingFields,
        receivedBody: req.body,
      });
    }

    user.username = username;
    user.education = education;
    user.employment = employment;

    user.baseline = {
      moodScore: Number(baseline.moodScore ?? 0),
      sleepHours: Number(baseline.sleepHours ?? 0),
      movementHours: Number(baseline.movementHours ?? 0),
      socialConnectionScore: Number(baseline.socialConnectionScore ?? 0),
      screenTimeHours: Number(baseline.screenTimeHours ?? 0),
      financialWorkSchoolStressScore: Number(
        baseline.financialWorkSchoolStressScore ?? 0,
      ),
    };

    user.formFinished = true;

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User form successfully saved",
      user: {
        id: user._id,
        email: user.email,

        gender: user.gender,
        dateOfBirth: user.dateOfBirth,

        username: user.username,
        education: user.education,
        employment: user.employment,

        baseline: user.baseline,

        formFinished: user.formFinished,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Form saving failed",
    });
  }
};
exports.me = async function (req, res) {
  try {
    const userId = req.user.userId || req.user.id;

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
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        education: user.education,
        employment: user.employment,
        mood: user.mood,
        sleepHours: user.sleepHours,
        activity: user.activity,
        socialConnection: user.socialConnection,
        phoneScreenTime: user.phoneScreenTime,
        stress: user.stress,
        formFinished: user.formFinished,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};

exports.userProfile = async function (req, res) {
  try {
    const userId = req.user.userId || req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const user = await User.findById(userId);

    const username = user.username;
    const gender = user.gender;
    const dateOfBirth = user.dateOfBirth;
    const education = user.education;
    const employment = user.employment;

    return res.json({
      success: true,
      message: "User profile data retrieval successfull",
      username,
      gender,
      dateOfBirth,
      education,
      employment
    });

  }
  catch(err)
  {
    return res.status(500).json({
      success: false,
      message: "User profile data retrival failed",
    });
  }
}



// TWO-FACTOR-AUTHENTICATION

const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const upload = multer({ dest: "uploads/" });

exports.verify2FA = [
  upload.single("image"),
  async function (req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      const imagePath = path.resolve(req.file.path);

      exec(
        `python3 ../ORV/Model/predict_image.py ${imagePath}`,
        async (err, stdout, stderr) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Python execution failed",
              error: stderr || err.message,
            });
          }

          const result = stdout.trim(); 
          const verified = result === "true";

          // OPTIONAL: če želiš, lahko shraniš stanje userja
          await User.findByIdAndUpdate(userId, {
            twoFactorEnabled: verified,
          });

          return res.json({
            success: true,
            verified,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "2FA verification failed",
        error: err.message,
      });
    }
  },
];

exports.toggle2FA = async function (req, res) {
  try {
    const userId = req.user.userId || req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;

    await user.save();

    return res.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle 2FA",
    });
  }
};