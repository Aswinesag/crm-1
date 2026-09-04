  const mongoose = require('mongoose');

  const activitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    user: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    details: mongoose.Schema.Types.Mixed,
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

  }, { timestamps: true });

  // Keep only activity logs from the last 2 months
  activitySchema.post('save', async function () {
    try {
      // Calculate the cutoff date (2 months ago)
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 2);

      // Delete all logs older than cutoff date
      await this.constructor.deleteMany({ createdAt: { $lt: cutoffDate } });
    } catch (err) {
      console.error("Error trimming activity logs:", err.message);
    }
  });

  module.exports = mongoose.model('ActivityLog', activitySchema);
