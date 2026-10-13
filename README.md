# MailStream Pro

A full-stack email campaign platform built with Node.js, Express, MongoDB, and React.

---

## What it does

Users can create an account, add contacts, compose email campaigns, and send them to a selected list of recipients. Delivery status is tracked in real time — from sent to delivered or failed.

A welcome email is automatically sent when a new account is registered. There's also a forgot password flow using a 6-digit verification code sent to the user's email.

---

## Tech Stack

**Frontend** — React 18, Vite, React Router, Vanilla CSS  
**Backend** — Node.js, Express.js, MongoDB Atlas, Mongoose  
**Auth** — JWT, BcryptJS  
**Email** — Brevo HTTP API (primary), Nodemailer SMTP (fallback)

---

## Getting Started

**Backend**
```bash
cd backend
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `backend/.env` file:

```env
PORT=5001
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d

# Brevo (recommended)
BREVO_API_KEY=

# SMTP fallback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

FROM_EMAIL=
FROM_NAME=MailStream Pro
```

If `BREVO_API_KEY` is set and starts with `xkeysib-`, it uses Brevo's API. Otherwise it falls back to SMTP.

---

## API Overview

**Auth** — `/api/auth`
- `POST /register` — create account, triggers welcome email
- `POST /login` — returns JWT
- `GET /me` — current user
- `POST /forgot-password` — sends reset code
- `POST /reset-password` — verifies code and updates password

**Recipients** — `/api/recipients`
- `GET /` — list with search and pagination
- `POST /` — add contact
- `PATCH /:id` — update
- `DELETE /:id` — remove

**Campaigns** — `/api/campaigns`
- `GET /` — list campaigns
- `POST /` — create draft
- `GET /dashboard/summary` — analytics
- `GET /:id` — campaign details with stats
- `PATCH /:id` — edit draft
- `DELETE /:id` — delete
- `POST /:id/send` — dispatch to all recipients
- `GET /:id/recipients` — delivery records per recipient

---

## Project Structure

```
email-campaign-app/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/     # email dispatch logic
│       └── middleware/
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── context/      # auth state
        └── services/     # api fetch wrapper
```
