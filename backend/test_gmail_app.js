require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER || 'rarevisionns@gmail.com';
const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user, pass },
  tls: { rejectUnauthorized: false },
});

console.log(`[Gmail Official Server] Dispatching via ${user}...`);

transporter.sendMail({
  from: `"MailStream Pro" <${user}>`,
  to: 'ramadanadex111@gmail.com, rarevisionns@gmail.com',
  subject: '🔥 Direct Primary Inbox Delivery via Google Official Servers',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #6366f1;">
      <h2 style="color: #4f46e5; margin-top: 0;">MailStream Pro — Google Official Server Delivery</h2>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Hello Ramadan! This campaign email was sent directly through <strong>smtp.gmail.com</strong> using your App Password!
      </p>
      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px; border-radius: 4px; margin: 16px 0;">
        <strong style="color: #15803d;">✓ SPF & DKIM Authenticated by Google</strong>
        <p style="margin: 4px 0 0 0; color: #166534; font-size: 14px;">Delivered straight to Primary Inbox with 0% Spam!</p>
      </div>
    </div>
  `,
})
.then(info => {
  console.log(`✅ [Gmail Success] Delivered! Message ID: ${info.messageId}`);
  process.exit(0);
})
.catch(err => {
  console.error('❌ [Gmail Error]:', err.message);
  process.exit(1);
});
