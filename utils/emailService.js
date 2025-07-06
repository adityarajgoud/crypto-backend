// backend/utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // your 16-char App Password
  },
});

const sendResetEmail = async (to, resetToken) => {
  const resetLink = `http://localhost:3001/reset-password/${resetToken}`; // Change if frontend URL is different

  const mailOptions = {
    from: `"Crypto Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" target="_blank" style="padding: 10px 20px; background: #2e86de; color: white; text-decoration: none;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
