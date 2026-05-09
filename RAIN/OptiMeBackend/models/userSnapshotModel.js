const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSnapshotSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'user', required: true, index: true},
    date: { type: Date, default: Date.now, required: true },

	//mental health parameters
	mood: { type: Number, required: false },
	stress: { type: Number, required: false },
	anxiety: { type: Number, required: false },

	//tracked parameters
	sleepHours: { type: Number, required: false },
	steps: { type: Number, required: false },
	screenTimeHours: { type: Number, required: false },
});

module.exports = mongoose.model('userSnapshots', UserSnapshotSchema);