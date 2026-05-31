const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },

  username: { type: String, required: false },
  education: { type: String, required: false },
  employment: { type: String, required: false },

  baseline: {
    moodScore: { type: Number, required: false },
    sleepHours: { type: Number, required: false },
    movementHours: { type: Number, required: false },
    socialConnectionScore: { type: Number, required: false },
    screenTimeHours: { type: Number, required: false },
    financialWorkSchoolStressScore: { type: Number, required: false },
  },

  formFinished: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("user", UserSchema);
