/**
 * Email Service - Sends OTP emails via Gmail using Nodemailer
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Use an App Password, NOT your real Gmail password
    }
});

/**
 * Send a styled OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} type - 'reset' or 'verify'
 */
const sendOTPEmail = async (email, otp, type = 'reset') => {
    const subject = type === 'reset'
        ? '🔐 Banana Hunt — Password Reset Code'
        : '🍌 Banana Hunt — Verify Your Email';

    const actionText = type === 'reset'
        ? 'You requested to reset your password. Use the code below:'
        : 'Please verify your email address using the code below:';

    const mailOptions = {
        from: `"Banana Hunt 🍌" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            body { margin:0; padding:0; background:#0a0a0f; font-family:'Inter',Arial,sans-serif; }
            .wrapper { max-width:480px; margin:40px auto; }
            .card { background:#13131a; border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden; }
            .header { background:linear-gradient(135deg,#f5c518,#ff8c00); padding:32px; text-align:center; }
            .header-emoji { font-size:48px; display:block; margin-bottom:8px; }
            .header-title { color:#0a0a0f; font-size:22px; font-weight:900; margin:0; letter-spacing:-0.02em; }
            .body { padding:36px 32px; }
            .greeting { color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 12px; }
            .action-text { color:#fff; font-size:15px; font-weight:500; margin:0 0 28px; line-height:1.6; }
            .otp-box { background:rgba(245,197,24,0.08); border:2px solid rgba(245,197,24,0.3); border-radius:16px; padding:24px; text-align:center; margin-bottom:28px; }
            .otp-label { color:rgba(255,255,255,0.45); font-size:11px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; margin:0 0 8px; }
            .otp-code { color:#f5c518; font-size:42px; font-weight:900; letter-spacing:0.3em; margin:0; }
            .expiry { color:rgba(255,255,255,0.35); font-size:12px; margin:0 0 28px; text-align:center; }
            .warning { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:12px; padding:16px; }
            .warning-text { color:rgba(255,255,255,0.5); font-size:12px; margin:0; line-height:1.6; }
            .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.06); text-align:center; }
            .footer-text { color:rgba(255,255,255,0.2); font-size:11px; margin:0; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="card">
              <div class="header">
                <span class="header-emoji">🍌</span>
                <p class="header-title">Banana Hunt</p>
              </div>
              <div class="body">
                <p class="greeting">Hello, Hunter!</p>
                <p class="action-text">${actionText}</p>
                <div class="otp-box">
                  <p class="otp-label">Your Verification Code</p>
                  <p class="otp-code">${otp}</p>
                </div>
                <p class="expiry">⏰ This code expires in <strong style="color:#f5c518">10 minutes</strong></p>
                <div class="warning">
                  <p class="warning-text">⚠️ If you didn't request this, please ignore this email. Your account remains secure and no changes were made.</p>
                </div>
              </div>
              <div class="footer">
                <p class="footer-text">© 2026 Banana Hunt · RDN Fun Game</p>
              </div>
            </div>
          </div>
        </body>
        </html>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] OTP sent to ${email}`);
};

module.exports = { sendOTPEmail };
