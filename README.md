# MailStream Pro

> **Full-Stack Email Campaign Platform**  
> Node.js · Express · MongoDB Atlas · React (Vite) · Brevo API · Nodemailer

---

## Overview

**MailStream Pro** is a production-ready email marketing and deliverability platform. It lets businesses, founders, and marketing teams build contact lists, compose targeted email campaigns, send via Brevo's API (or any SMTP provider), and monitor real-time delivery outcomes — all from a sleek dark-mode dashboard.

---

## Features

| Feature | Description |
|---|---|
| 🔐 **Auth & Security** | JWT-based authentication with bcrypt password hashing |
| 📧 **Welcome Emails** | Styled dark-brand onboarding email sent automatically on signup |
| 🔑 **Password Reset** | 6-digit email verification code flow with 15-minute expiry |
| 👥 **Recipients Management** | Full CRUD with live search and pagination |
| 📨 **Campaign Builder** | 3-step wizard: Content → Audience → Review & Launch |
| 🚀 **Email Dispatch** | Brevo HTTP API (primary) with Nodemailer SMTP fallback |
| 📊 **Live Delivery Polling** | Auto-refreshes `PENDING → SENT → DELIVERED` statuses every 2.5s |
| 📈 **Analytics Dashboard** | Campaign totals, delivery rates, and recent campaign table |
| 🌑 **Dark UI** | Resend-inspired dark theme with emerald green accents |

---

## Tech Stack

### Frontend
- **React 18** + **Vite** — fast dev server and HMR
- **React Router v7** — client-side routing with protected routes
- **Lucide React** — icon library
- **Vanilla CSS** — custom dark design system (CSS variables, glass cards, animations)
- **Fonts**: Inter (sans), Instrument Serif (display), JetBrains Mono (mono)

### Backend
- **Node.js** + **Express.js** — REST API server
- **MongoDB Atlas** + **Mongoose** — cloud database with ODM
- **JSON Web Tokens (JWT)** — stateless authentication
- **BcryptJS** — password hashing
- **Brevo HTTP API** — primary transactional email delivery
- **Nodemailer** — SMTP fallback email transport

---

## Database Schema

```
Users
  _id, name, email, passwordHash, createdAt

Recipients
  _id, userId (ref), firstName, lastName, email, createdAt

Campaigns
  _id, userId (ref), name, subject, content, status, sentAt, createdAt

CampaignRecipients
  _id, campaignId (ref), recipientId (ref), status,
  providerMessageId, failureReason, sentAt, deliveredAt, failedAt

EmailEvents
  _id, campaignRecipientId (ref), eventType, providerMessageId, details
```

**Campaign Status Flow**: `DRAFT` → `SENDING` → `SENT` → `DELIVERED` / `FAILED`

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create account + send welcome email |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Get current user profile |
| `POST` | `/api/auth/forgot-password` | Public | Send 6-digit reset code by email |
| `POST` | `/api/auth/reset-password` | Public | Verify code and set new password |

**Register**
```json
POST /api/auth/register
{
  "name": "Ramadan Adewale",
  "email": "ramadanadex111@gmail.com",
  "password": "Password123!"
}
```

**Forgot Password**
```json
POST /api/auth/forgot-password
{ "email": "ramadanadex111@gmail.com" }
```

**Reset Password**
```json
POST /api/auth/reset-password
{
  "email": "ramadanadex111@gmail.com",
  "code": "482910",
  "newPassword": "NewPassword123!"
}
```

---

### Recipients — `/api/recipients`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/recipients?page=1&limit=10&search=john` | List with search & pagination |
| `POST` | `/api/recipients` | Create recipient |
| `PATCH` | `/api/recipients/:id` | Update recipient |
| `DELETE` | `/api/recipients/:id` | Delete recipient |

**Create Recipient**
```json
POST /api/recipients
{
  "firstName": "Ramadan",
  "lastName": "Adewale",
  "email": "ramadanadex111@gmail.com"
}
```

---

### Campaigns — `/api/campaigns`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/campaigns?page=1&limit=10&search=welcome` | List campaigns |
| `POST` | `/api/campaigns` | Create draft campaign |
| `GET` | `/api/campaigns/:id` | Get campaign with stats |
| `PATCH` | `/api/campaigns/:id` | Update draft campaign |
| `DELETE` | `/api/campaigns/:id` | Delete campaign |
| `POST` | `/api/campaigns/:id/send` | Dispatch campaign to recipients |
| `GET` | `/api/campaigns/:id/recipients` | List delivery records |
| `GET` | `/api/campaigns/dashboard/summary` | Analytics dashboard data |

**Create & Send Campaign**
```json
POST /api/campaigns
{
  "name": "October Newsletter",
  "subject": "Big updates this month!",
  "content": "Hi {firstName}, here's what's new...",
  "recipientIds": ["6ac3c228827d8c5e828414b0", "6ac3c228827d8c5e828414b1"]
}

POST /api/campaigns/:id/send
```

---

## Standard API Response Format

**Success**
```json
{
  "success": true,
  "message": "Campaign dispatched successfully",
  "data": {
    "campaignId": "6ac42c081572318a5ca35a10",
    "status": "SENT",
    "totalSent": 5,
    "totalFailed": 0
  }
}
```

**Error**
```json
{
  "success": false,
  "message": "Please select at least one recipient.",
  "data": null
}
```

---

## Environment Variables

Create a `backend/.env` file:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# ─── Email Provider ────────────────────────────────────────
# Option A: Brevo HTTP API (recommended — free tier: 300 emails/day)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Option B: SMTP Fallback (Gmail, Mailgun, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Sender Identity
FROM_EMAIL=your_email@gmail.com
FROM_NAME=MailStream Pro
```

> **Note:** If `BREVO_API_KEY` starts with `xkeysib-`, the app uses Brevo's HTTP API automatically. Otherwise it falls back to SMTP via Nodemailer.

---

## Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## Deployment

The app is structured for easy deployment on any Node.js-compatible platform:

- **Backend**: Render, Railway, Fly.io, or any Node host
- **Frontend**: Vercel, Netlify, or served as static build
- **Database**: MongoDB Atlas (free M0 cluster)
- **Email**: Brevo free tier (300 emails/day, no credit card required)

### Production Environment Variables (Backend)
Set all variables from the `.env` section above in your hosting platform's environment settings. The `BREVO_API_KEY` is the only email variable required for production — no SMTP setup needed.

---

## Project Structure

```
email-campaign-app/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # emailService (Brevo + Nodemailer)
│   │   └── app.js
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Sidebar, Modal, Badge, Pagination
    │   ├── context/         # AuthContext (JWT + user state)
    │   ├── pages/           # LandingPage, Dashboard, Campaigns, Recipients, Login, Register
    │   ├── services/        # api.js (fetch wrapper)
    │   └── index.css        # Dark design system (CSS variables)
    └── index.html
```

---

*Built with ❤️ — MailStream Pro*
