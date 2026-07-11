import { Resend } from "resend";

const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured in the environment variables");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  });

  if (error) {
    throw new Error(`Resend SDK error: ${error.name} - ${error.message}`);
  }
  return data;
};

export default sendEmail;
