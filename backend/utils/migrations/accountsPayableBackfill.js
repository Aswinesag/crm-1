const mongoose = require("mongoose");
require("dotenv").config();
const { backfill } = require("../../services/accountsPayableService");
const User = require("../../models/User");

(async () => {
  const apply = process.argv.includes("--apply");
  const actorArgument = process.argv.find((argument) => argument.startsWith("--actor=")); const actor = actorArgument?.slice("--actor=".length);
  await mongoose.connect(process.env.MONGODB_URI);
  if (apply) {
    if (!mongoose.isValidObjectId(actor)) throw new Error("--apply requires --actor=<existing-admin-user-id>");
    const user = await User.findById(actor).select("role");
    if (!user || !["Admin", "Super Admin"].includes(user.role)) throw new Error("--apply requires --actor=<existing-admin-user-id>");
  }
  const result = await backfill({ apply, actor }); console.log(JSON.stringify(result, null, 2));
  await mongoose.disconnect();
})().catch(async (error) => { console.error(error.message); if (mongoose.connection.readyState) await mongoose.disconnect(); process.exit(1); });
