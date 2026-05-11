const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserStDataSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    storagePath: { type: String, required: true },
    importedForDate: { type: Date, required: true, index: true },
    isProcessed: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('userStData', UserStDataSchema);