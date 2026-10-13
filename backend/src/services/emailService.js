const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

const sendViaBrevoApi = async ({ toName, toEmail, subject, htmlContent }) => {
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail, name: toName || '' }],
      subject,
      htmlContent,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Brevo API error status ${response.status}`);
  }
  return data.messageId || `msg_brevo_${Date.now()}`;
};

const getNodemailerTransporter = async () => {
  const brevoKey = (process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY || '').trim();

  if (brevoKey && brevoKey.startsWith('xsmtpsib-')) {
    const brevoUser = process.env.BREVO_USER || process.env.SMTP_USER || process.env.FROM_EMAIL;
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: { user: brevoUser, pass: brevoKey },
      pool: false,
      connectionTimeout: 12000,
      tls: { rejectUnauthorized: false },
    });
  }

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const user = process.env.SMTP_USER;
  const rawPass = process.env.SMTP_PASS || '';
  const pass = rawPass.trim().replace(/\s+/g, '');
  const preferredPort = parseInt(process.env.SMTP_PORT, 10) || 587;
  const preferredSecure = process.env.SMTP_SECURE === 'true' || preferredPort === 465;

  if (user && pass && user !== 'mock_user') {
    return nodemailer.createTransport({
      host,
      port: preferredPort,
      secure: preferredSecure,
      auth: { user, pass },
      pool: false,
      connectionTimeout: 12000,
      tls: { rejectUnauthorized: false },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const sendCampaignEmails = async (campaign, recipients) => {
  const sendResults = [];
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const isBrevoHttpApi = brevoApiKey.startsWith('xkeysib-');

  let transporter = null;
  if (!isBrevoHttpApi) {
    transporter = await getNodemailerTransporter();
  }

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const defaultMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; color: #0f172a;">
        <div style="background-color: #00925d; padding: 20px 24px;">
          <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">MailStream Pro</span>
        </div>
        <div style="padding: 28px 24px;">
          <h1 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; line-height: 1.3;">${campaign.subject}</h1>
          <div style="line-height: 1.7; font-size: 15px; color: #334155; white-space: pre-wrap;">${campaign.content}</div>
        </div>
        <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
          <span>Sent to: <strong>${recipient.firstName || ''} ${recipient.lastName || ''}</strong> (${recipient.email})</span>
          <span style="font-weight: 600; color: #00925d;">Powered by MailStream Pro</span>
        </div>
      </div>
    `;

    try {
      let messageId = defaultMsgId;
      let previewUrl = null;

      if (isBrevoHttpApi) {
        messageId = await sendViaBrevoApi({
          toName: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
          toEmail: recipient.email,
          subject: campaign.subject,
          htmlContent,
        });
      } else {
        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          to: `"${recipient.firstName || ''} ${recipient.lastName || ''}" <${recipient.email}>`,
          subject: campaign.subject,
          html: htmlContent,
        });
        messageId = info.messageId || defaultMsgId;
        previewUrl = nodemailer.getTestMessageUrl(info) || null;
      }

      sendResults.push({
        recipientId: recipient._id,
        email: recipient.email,
        status: 'SENT',
        providerMessageId: messageId,
        previewUrl,
        sentAt: new Date(),
      });
    } catch (error) {
      const errorDetail = error.message || 'Email delivery failed';
      console.error(`[Email Send Error] Recipient: ${recipient.email} - ${errorDetail}`);
      sendResults.push({
        recipientId: recipient._id,
        email: recipient.email,
        status: 'FAILED',
        failureReason: errorDetail,
        providerMessageId: defaultMsgId,
        sentAt: null,
        failedAt: new Date(),
      });
    }
  }

  return sendResults;
};

const sendWelcomeEmail = async (user) => {
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';
  const firstName = user.name ? user.name.split(' ')[0] : 'there';
  const subject = `Hi ${firstName}, welcome to MailStream Pro! 🎉`;
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const isBrevoHttpApi = brevoApiKey.startsWith('xkeysib-');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; color: #ededed;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 28px 24px; text-align: center;">
        <div style="display: inline-flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(0,0,0,0.25); display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; display: inline;">MailStream Pro</h1>
        </div>
      </div>
      <div style="padding: 36px 28px;">
        <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Hi ${user.name}, welcome aboard! 👋</h2>
        <p style="line-height: 1.7; font-size: 15px; color: #a1a1a1; margin-bottom: 20px;">
          We're thrilled to have you on board! With MailStream Pro, you can create powerful email campaigns, target recipients, and track real-time delivery outcomes — all from one dashboard.
        </p>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-left: 4px solid #10b981; padding: 18px 20px; margin: 28px 0; border-radius: 0 10px 10px 0;">
          <strong style="color: #10b981; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Quick Start</strong>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #a1a1a1; line-height: 1.6;">
            Add your contacts under <strong style="color: #ededed;">Recipients</strong>, then create your first campaign in just a few clicks.
          </p>
        </div>
        <p style="line-height: 1.7; font-size: 14px; color: #6b6b6b;">
          If you have any questions, simply reply to this email — we're always happy to help.
        </p>
        <p style="margin-top: 28px; font-size: 15px; color: #ededed; font-weight: 600;">
          Best regards,<br/>The MailStream Pro Team
        </p>
      </div>
      <div style="background: rgba(255,255,255,0.03); padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #6b6b6b; text-align: center;">
        Sent to <strong style="color: #a1a1a1;">${user.email}</strong> &bull; Powered by MailStream Pro
      </div>
    </div>
  `;

  try {
    if (isBrevoHttpApi) {
      await sendViaBrevoApi({ toName: user.name, toEmail: user.email, subject, htmlContent });
    } else {
      const transporter = await getNodemailerTransporter();
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: `"${user.name}" <${user.email}>`,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error(`[Welcome Email Error] Failed to send welcome email to ${user.email}:`, err.message);
  }
};

const sendPasswordResetEmail = async ({ name, email, code }) => {
  const fromName = process.env.FROM_NAME || 'MailStream Pro';
  const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'campaigns@mailstream.io';
  const subject = `Your Password Reset Code: ${code}`;
  const brevoApiKey = (process.env.BREVO_API_KEY || '').trim();
  const isBrevoHttpApi = brevoApiKey.startsWith('xkeysib-');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; color: #ededed;">
      <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 28px 24px; text-align: center;">
        <div style="display: inline-flex; align-items: center; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(0,0,0,0.25); display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; display: inline;">MailStream Pro</h1>
        </div>
      </div>
      <div style="padding: 36px 28px;">
        <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px;">Password Reset Request</h2>
        <p style="line-height: 1.7; font-size: 15px; color: #a1a1a1; margin-bottom: 20px;">
          Hi ${name || 'there'}, we received a request to reset your password. Use the 6-digit verification code below:
        </p>
        <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); padding: 28px 20px; text-align: center; border-radius: 12px; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #10b981; font-family: monospace;">${code}</span>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #6b6b6b;">This code expires in <strong style="color: #a1a1a1;">15 minutes</strong>.</p>
        </div>
        <p style="line-height: 1.7; font-size: 14px; color: #6b6b6b;">
          If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
      <div style="background: rgba(255,255,255,0.03); padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #6b6b6b; text-align: center;">
        Sent to <strong style="color: #a1a1a1;">${email}</strong> &bull; Powered by MailStream Pro
      </div>
    </div>
  `;

  try {
    if (isBrevoHttpApi) {
      await sendViaBrevoApi({ toName: name, toEmail: email, subject, htmlContent });
    } else {
      const transporter = await getNodemailerTransporter();
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: `"${name || 'User'}" <${email}>`,
        subject,
        html: htmlContent,
      });
    }
  } catch (err) {
    console.error(`[Reset Email Error] Failed to send reset code to ${email}:`, err.message);
    throw err;
  }
};

module.exports = {
  sendCampaignEmails,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
