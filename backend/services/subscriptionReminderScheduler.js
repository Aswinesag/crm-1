const { runSubscriptionReminderJob } = require("./subscriptionReminderService");
let timer;
const scheduleNext = () => {
  timer = setTimeout(async () => {
    try { await runSubscriptionReminderJob(); } catch (error) { console.error("Subscription reminder job failed", { message: error.message }); }
    scheduleNext();
  }, 24 * 60 * 60 * 1000);
  timer.unref();
};
const startSubscriptionReminderScheduler = () => {
  if (process.env.SUBSCRIPTION_REMINDER_SCHEDULER_ENABLED !== "true" || timer) return;
  setTimeout(async () => { try { await runSubscriptionReminderJob(); } catch (error) { console.error("Subscription reminder job failed", { message: error.message }); } finally { scheduleNext(); } }, 10000).unref();
};
module.exports = { startSubscriptionReminderScheduler };
