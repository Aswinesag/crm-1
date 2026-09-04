const mongoose = require('mongoose');
const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
  description: String,
  date: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // creator/owner id
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null }, // optional link to a lead
  createby: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
ReminderSchema.index({ date: 1 }, { expireAfterSeconds: 0 });

const Reminder = mongoose.model('Reminder', ReminderSchema);

module.exports = Reminder;
