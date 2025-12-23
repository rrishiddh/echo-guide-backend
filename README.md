# Echo Guide — Backend API 

A scalable and secure backend service for **Echo Guide**, an audio-focused guide platform.  
This backend powers authentication, content management, media uploads, and payments — built with **Node.js, Express, TypeScript, and MongoDB**.

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [API Endpoints](#-api-endpoints)
- [Security & Middleware](#-security--middleware)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Links](#-links)
- [License](#-license)
- [Contact](#-contact)

---

## Features

-  Authentication & Authorization (JWT-based)
-  User management with password hashing
-  RESTful APIs for core application features
-  Media uploads using Cloudinary
-  Payment integration with Stripe
-  Security best practices with Helmet & Rate Limiting
-  Centralized logging using Winston
-  Input validation using Zod & Express Validator
-  Scalable Express 5 architecture
-  Production-ready deployment on Vercel

---

##  Tech Stack

| Layer | Technology |
|------|------------|
| Language | TypeScript |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| File Uploads | Multer + Cloudinary |
| Payments | Stripe |
| Security | Helmet, Rate Limiter |
| Validation | Zod, Express Validator |
| Logging | Winston |
| Deployment | Vercel |

---

## Project Structure

```text
echo-guide-backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── models/
│   ├── validators/
│   ├── utils/
│   └── app.ts
├── .env
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## 🛠 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js >=18.x
- npm or yarn
- MongoDB (local or cloud)
- Cloudinary account
- Stripe account

---

### Installation

Clone the repository:

```bash
git clone https://github.com/rrishiddh/echo-guide-backend.git
cd echo-guide-backend
```

Install dependencies:

```bash
npm install
# or
yarn install
```

---

### Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/echo-guide

JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

STRIPE_SECRET_KEY=your-stripe-secret-key

CLIENT_URL=http://localhost:3000
```

---

### Database Setup

MongoDB is used via Mongoose.  
Ensure your MongoDB connection string is valid in `.env`.

No manual migrations are required.

---

### Running Locally

```bash
npm run dev
```

Server will start at:

```text
http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint | Description |
|------|---------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user |
| GET | `/user/profile` | Get user profile |
| POST | `/upload` | Upload media |
| POST | `/payments/checkout` | Stripe payment |

> Endpoints may evolve as the project grows.

---

## Security & Middleware

- Helmet for secure HTTP headers
- Rate limiting to prevent abuse
- JWT authentication middleware
- CORS configuration for frontend access
- Centralized error handling

---

## Testing

Manual API testing supported using:

- Postman
- Thunder Client

Automated testing can be added using Jest or Vitest.

---

## Deployment

The backend is deployed on **Vercel**.

Production build command:

```bash
npm run build
```

---

## Links

### Live Applications

- **Backend API (Health Check):**  
  https://echo-guide-backend.vercel.app/health

- **Frontend App:**  
  https://echo-guide-client.vercel.app/

###  GitHub Repositories

- **Backend:**  
  https://github.com/rrishiddh/echo-guide-backend

- **Frontend:**  
  https://github.com/rrishiddh/echo-guide-frontend
