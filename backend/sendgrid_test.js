require('dotenv').config();
const sgMail = require('@sendgrid/mail');

if (!process.env.SENDGRID_API_KEY) {
  console.error('Error: SENDGRID_API_KEY is not set in environment.');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY.trim());

const targetEmail = process.argv[2] || 'rarevisionns@gmail.com';
const fromEmail = process.env.FROM_EMAIL || 'rarevisionns@gmail.com';
const fromName = process.env.FROM_NAME || 'MailStream Pro';

console.log(`[SendGrid Test] Sending email to: ${targetEmail} from: ${fromName} <${fromEmail}>...`);

const msg = {
  to: targetEmail,
  from: { email: fromEmail, name: fromName },
  subject: 'MailStream Pro - SendGrid Live Delivery Confirmation',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; color: #1e293b;">
      <div style="border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 22px;">SendGrid Live Email Delivery</h1>
      </div>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">
        Hello! This email confirms that SendGrid API successfully dispatched your campaign email to <strong>${targetEmail}</strong>.
      </p>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        <span>Sent via SendGrid HTTPS Engine • Powered by MailStream Pro</span>
      </div>
    </div>
  `,
};

sgMail
  .send(msg)
  .then((response) => {
    console.log(`✅ [SendGrid Success] HTTP ${response[0].statusCode}`);
    console.log(`   Message ID: ${response[0].headers['x-message-id']}`);
    console.log(`   Check ${targetEmail} (including Spam/Junk folder if not in Primary inbox).`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ [SendGrid Dispatch Failed]:', error.message);
    if (error.response?.body) {
      console.error('Details:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  });
