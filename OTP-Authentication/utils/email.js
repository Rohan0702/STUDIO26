const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPass) {
    console.error(
      "[EMAIL ERROR] EMAIL_USER or EMAIL_PASSWORD environment variable is missing.",
      "EMAIL_USER is", emailUser ? "set" : "NOT SET",
      "| EMAIL_PASSWORD is", emailPass ? "set" : "NOT SET"
    );
    throw new Error("Email service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.");
  }

  console.log(`[EMAIL] Sending OTP to ${email} using sender ${emailUser}...`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  try {
    const info = await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: "APEX OPS — Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a1a; border-radius: 12px; border: 1px solid #1a1a3a;">
          <h2 style="color: #a78bfa; margin: 0 0 8px;">APEX Operations</h2>
          <p style="color: #94a3b8; margin: 0 0 24px; font-size: 14px;">Identity Verification</p>
          <div style="background: #1a1a2e; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <p style="color: #94a3b8; margin: 0 0 12px; font-size: 14px;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${otp}</div>
          </div>
          <p style="color: #64748b; font-size: 12px; margin: 0;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    });

    console.log(`[EMAIL] OTP sent successfully to ${email}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send OTP to ${email}:`, err.message);
    throw err;
  }
};

module.exports = sendOTP;