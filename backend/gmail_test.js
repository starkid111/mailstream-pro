require('dotenv').config();
const nodemailer = require('nodemailer');

const user = process.env.SMTP_USER || 'rarevisionns@gmail.com';
const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user, pass },
});

const targets = process.argv[2] || 'ramadanadex111@gmail.com, rarevisionns@gmail.com';

console.log(`[Gmail Official Server] Dispatching to: ${targets}...`);

transporter.sendMail({
  from: `"MailStream Pro" <${user}>`,
  to: targets,
  subject: '🔥 Primary Inbox Confirmation - MailStream Pro',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #6366f1;">
      <h2 style="color: #4f46e5; margin-top: 0;">Google Official Server Delivery</h2>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Hello! This email was dispatched directly through <strong>smtp.gmail.com</strong>.
      </p>
      <p style="font-size: 14px; color: #16a34a; font-weight: bold;">
        ✓ SPF & DKIM Verified by Google • Delivered straight to Primary Inbox!
      </p>
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Powered by MailStream Pro
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
