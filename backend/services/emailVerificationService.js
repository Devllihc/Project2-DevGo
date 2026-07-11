import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

const VERIFICATION_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 hours

// Generates a verification token, saves its hash on the user, and emails the
// verify link. Shared by registration and the existing-user backfill script.
export const sendVerificationEmail = async (user) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  user.emailVerificationExpires = Date.now() + VERIFICATION_EXPIRES_MS;
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "DevGo - Verify your email",
      message: `Please verify your email by visiting: ${verifyUrl}`,
      html: `<h1>Welcome to DevGo!</h1><p>Please verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    });
  } catch (error) {
    logger.error({ err: error }, "Verification email send failed");
  }
};
