import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // You can use other services like SendGrid, Mailgun, etc.
    family: 4,        // Force IPv4 to prevent ENETUNREACH errors on IPv6-only/restricted cloud environments
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000,     // 10 seconds
  });

  const mailOptions = {
    from: `DevGo <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
