import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is not configured in the environment variables");
  }

  // Create a transporter using Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `DevGo <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export default sendEmail;
