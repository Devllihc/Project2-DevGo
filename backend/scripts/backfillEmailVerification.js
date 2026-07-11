// One-off backfill: sends a verification email to every pre-existing user
// account (created before the emailVerified field existed) so they can be
// brought up to the same standard as new signups.
//
// Usage (run from backend/):
//   node scripts/backfillEmailVerification.js --dry-run   # preview only, sends nothing
//   node scripts/backfillEmailVerification.js             # actually sends emails
//
// Sends one email at a time with a short delay to stay well under typical
// SMTP provider rate limits (e.g. Gmail's ~500/day, ~1-2 msgs/sec burst caps).
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { default: userModel } = await import("../models/userModel.js");
const { sendVerificationEmail } = await import("../services/emailVerificationService.js");

const DELAY_BETWEEN_EMAILS_MS = 1200;
const dryRun = process.argv.includes("--dry-run");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to MongoDB");

  const unverifiedUsers = await userModel.find({ emailVerified: { $ne: true } });
  console.log(`Found ${unverifiedUsers.length} unverified user(s).`);

  if (dryRun) {
    console.log("--dry-run: no emails sent.");
    return process.exit(0);
  }

  let sent = 0;
  let failed = 0;

  for (const user of unverifiedUsers) {
    try {
      await sendVerificationEmail(user);
      sent++;
    } catch (err) {
      failed++;
      console.error(`Failed to send to user ${user._id}:`, err.message);
    }
    console.log(`Progress: ${sent + failed}/${unverifiedUsers.length}`);
    await sleep(DELAY_BETWEEN_EMAILS_MS);
  }

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
