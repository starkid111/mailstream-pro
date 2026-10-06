# MailStream Pro — Full-Stack Email Campaign Platform

> **Capstone Project**: Email Campaign App  
> **Tech Stack**: Node.js, Express.js, MongoDB Atlas (Mongoose), React.js (Vite), Nodemailer (SMTP Engine), Lucide Icons  
> **Branding & UI Theme**: Emerald Green SaaS Design (`#00925d`)

---

## 1. Product Overview

### What is MailStream Pro?
MailStream Pro is an end-to-end email marketing and campaign deliverability platform. It allows businesses, founders, and marketing teams to build recipient contact lists, compose targeted group email campaigns, automatically trigger welcome emails upon signup, dispatch emails via Nodemailer (SMTP), and monitor delivery statuses (`PENDING`, `SENT`, `DELIVERED`, `FAILED`) in real time with background auto-polling.

### Key Features
1. **Automated User Onboarding**: Automatically sends a styled welcome email to newly registered users upon account creation (`Hi {Name}, welcome to MailStream Pro! 🎉`).
2. **Contact & Audience Management**: Full CRUD operations for contact lists, with live search filtering and paginated data tables.
3. **Campaign Creation Wizard**: Step-by-step campaign builder allowing custom subject lines, message bodies, and targeted recipient selection.
4. **Real-Time Live Delivery Polling**: Automatic background polling streams delivery status transitions (`SENT` -> `DELIVERED` 100%) live on the campaign monitor without requiring page refreshes.
5. **SMTP Dispatch Engine**: Powered by standard pooled Nodemailer SMTP transport with custom App Password support and connection lifecycle management.
6. **Strict Data Privacy**: All user contacts, campaigns, and delivery logs are isolated to the authenticated account.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, React Router DOM, Lucide React Icons, Vanilla CSS Design System (`#00925d` Emerald SaaS Theme).
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), BcryptJS.
- **Database**: MongoDB Atlas Cloud, Mongoose ORM.
- **Email Engine**: Nodemailer (Pooled SMTP connection pool with connection reuse).

---

## 3. Database Schema (Mongoose Models)

The application follows a normalized relational structure across MongoDB collections:

- **Users**: User authentication accounts (`_id`, `name`, `email`, `passwordHash`, `createdAt`).
- **Recipients**: Contact lists owned by users (`_id`, `userId`, `firstName`, `lastName`, `email`, `createdAt`).
- **Campaigns**: Email content drafts & sent broadcasts (`_id`, `userId`, `name`, `subject`, `content`, `status`, `sentAt`).
- **CampaignRecipients**: Join entity mapping target recipients to campaigns (`_id`, `campaignId`, `recipientId`, `status`, `providerMessageId`, `failureReason`, `sentAt`, `deliveredAt`, `failedAt`).
- **EmailEvents**: Deliverability audit log (`_id`, `campaignRecipientId`, `eventType`, `providerMessageId`, `details`).

---

## 4. Standardized API Response Structure

All backend endpoints return a consistent JSON response signature:

### Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "message": "Campaign dispatched successfully",
  "data": {
    "campaignId": "6ac42c081572318a5ca35a10",
    "status": "SENT",
    "totalSent": 2,
    "totalFailed": 0
  }
}
```

### Error Response (`HTTP 400 / 401 / 404 / 500`)
```json
{
  "success": false,
  "message": "Please select at least one recipient for this campaign.",
  "data": null
}
```

---

## 5. Comprehensive API Endpoints Documentation

### Authentication Routes (`/api/auth`)

#### 1. Register User & Trigger Welcome Email
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Ramadan Adewale",
    "email": "ramadanadex111@gmail.com",
    "password": "Password123!"
  }
  ```
- **Behavior**: Creates account, returns JWT token, and asynchronously dispatches onboarding welcome email to recipient.

#### 2. Login User
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "ramadanadex111@gmail.com",
    "password": "Password123!"
  }
  ```

#### 3. Get Current Profile
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Auth**: `Bearer <JWT_TOKEN>`

---

### Recipient Management Routes (`/api/recipients`)

#### 1. List Recipients (With Search & Pagination)
- **Method**: `GET`
- **Endpoint**: `/api/recipients?page=1&limit=10&search=ramadan`
- **Auth**: `Bearer <JWT_TOKEN>`

#### 2. Create Recipient
- **Method**: `POST`
- **Endpoint**: `/api/recipients`
- **Auth**: `Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "firstName": "Ramadan",
    "lastName": "Adewale",
    "email": "ramadanadex111@gmail.com"
  }
  ```

#### 3. Update / Delete Recipient
- **Method**: `PATCH` / `DELETE`
- **Endpoint**: `/api/recipients/:id`
- **Auth**: `Bearer <JWT_TOKEN>`

---

### Campaign Management Routes (`/api/campaigns`)

#### 1. List Campaigns
- **Method**: `GET`
- **Endpoint**: `/api/campaigns?page=1&limit=10&search=Welcome`
- **Auth**: `Bearer <JWT_TOKEN>`

#### 2. Create Draft Campaign
- **Method**: `POST`
- **Endpoint**: `/api/campaigns`
- **Auth**: `Bearer <JWT_TOKEN>`
- **Request Body**:
  ```json
  {
    "name": "Welcome & Onboarding Campaign",
    "subject": "Hi there, welcome to MailStream Pro!",
    "content": "Thank you for joining MailStream Pro...",
    "recipientIds": ["6ac3c228827d8c5e828414b0"]
  }
  ```

#### 3. Dispatch Email Campaign
- **Method**: `POST`
- **Endpoint**: `/api/campaigns/:id/send`
- **Auth**: `Bearer <JWT_TOKEN>`
- **Description**: Triggers pooled Nodemailer SMTP dispatch to all targeted recipients.

#### 4. Get Dashboard Analytics Summary
- **Method**: `GET`
- **Endpoint**: `/api/campaigns/dashboard/summary`
- **Auth**: `Bearer <JWT_TOKEN>`

---

## 6. Environment Configuration (`backend/.env`)

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Email Provider Configuration
EMAIL_PROVIDER=smtp

# SMTP Transport Credentials (e.g. Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Default Sender Identity
FROM_EMAIL=your_email@gmail.com
FROM_NAME=MailStream Pro
```

---

## 7. How to Run Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:5001
```

### 2. Start Frontend Web App
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```
