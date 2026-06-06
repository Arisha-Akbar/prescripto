# Prescripto

Prescripto is a full-stack doctor appointment platform built as a small monorepo with three separate applications:

- `frontend/`: patient-facing React application
- `admin/`: combined admin and doctor dashboard
- `backend/`: Express API with MongoDB, Cloudinary, JWT auth, and Stripe payments

The system lets patients browse doctors, book appointments, manage their profile, and pay online. Admins can add doctors, manage appointment activity, and view platform metrics. Doctors can log in to review appointments, mark visits complete, cancel appointments, and update their own profile details.

## System Overview

### Frontend (`frontend`)

The public app is a Vite + React client for patients. Core flows include:

- browse all doctors and filter by speciality
- view doctor detail pages and available slots
- register and log in as a patient
- book and cancel appointments
- manage profile data
- pay for appointments using Stripe Checkout

Main routes include:

- `/`
- `/doctors`
- `/doctors/:speciality`
- `/appointment/:docId`
- `/my-appointments`
- `/my-profile`
- `/login`

### Admin / Doctor Panel (`admin`)

This is a separate Vite + React app used by two roles:

- `Admin`: login with environment-configured admin credentials
- `Doctor`: login with doctor account credentials created by admin

Admin capabilities:

- add new doctors with image upload
- view doctors list
- change doctor availability
- view all appointments
- cancel appointments
- view dashboard metrics

Doctor capabilities:

- view personal dashboard
- view assigned appointments
- mark appointments complete
- cancel appointments
- update fees, address, and availability from profile

### Backend (`backend`)

The backend is an Express application that exposes REST endpoints under:

- `/api/user`
- `/api/doctor`
- `/api/admin`

Core backend responsibilities:

- user, doctor, and admin authentication
- appointment booking and cancellation
- doctor availability and slot tracking
- Cloudinary image upload handling through Multer
- MongoDB persistence using Mongoose
- Stripe Checkout session creation and payment verification

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- React Toastify
- Tailwind CSS
- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Cloudinary
- Stripe

## Repository Structure

```text
prescripto/
|- admin/       # Admin and doctor dashboard
|- backend/     # Express API
|- frontend/    # Patient-facing web app
`- vercel.json  # Vercel multi-service routing
```

## Environment Variables

### Backend `.env`

Create `backend/.env` with:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_prefix
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

Notes:

- `MONGODB_URI` is used as `${MONGODB_URI}/prescripto` in the current backend code.
- `FRONTEND_URL` must point to the patient app because Stripe redirects back to `/my-appointments`.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used for admin login in the `admin` app.

### Frontend `.env`

Create `frontend/.env` with:

```env
VITE_BACKEND_URL=http://localhost:4000
```

### Admin `.env`

Create `admin/.env` with:

```env
VITE_BACKEND_URL=http://localhost:4000
```

## Local Setup

### 1. Install dependencies

Install packages separately for each app:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

```bash
cd admin
npm install
```

### 2. Start the backend

```bash
cd backend
npm run server
```

The API runs on `http://localhost:4000` by default.

### 3. Start the patient frontend

```bash
cd frontend
npm run dev
```

Vite usually serves this app on `http://localhost:5173`.

### 4. Start the admin / doctor dashboard

```bash
cd admin
npm run dev
```

Vite will usually assign the next available port, commonly `http://localhost:5174`.

## Recommended Development Order

When running the full system locally:

1. start `backend`
2. start `frontend`
3. start `admin`

If the API is not running first, both frontend applications will fail to load doctors, authentication state, and dashboard data.

## Available Scripts

### Backend

```bash
npm start
npm run server
```

- `npm start`: run the API with Node
- `npm run server`: run the API with Nodemon for development

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Admin

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Summary

### User endpoints

- `POST /api/user/register`
- `POST /api/user/login`
- `GET /api/user/get-profile`
- `POST /api/user/update-profile`
- `POST /api/user/book-appointment`
- `GET /api/user/appointments`
- `POST /api/user/cancel-appointment`
- `POST /api/user/payment-stripe`
- `POST /api/user/verify-stripe-payment`

### Doctor endpoints

- `GET /api/doctor/list`
- `POST /api/doctor/login`
- `GET /api/doctor/appointments`
- `POST /api/doctor/complete-appointment`
- `POST /api/doctor/cancel-appointment`
- `GET /api/doctor/dashboard`
- `GET /api/doctor/profile`
- `POST /api/doctor/update-profile`

### Admin endpoints

- `POST /api/admin/login`
- `POST /api/admin/add-doctor`
- `POST /api/admin/all-doctors`
- `POST /api/admin/change-availability`
- `POST /api/admin/cancel-appointment`
- `GET /api/admin/appointments`
- `GET /api/admin/dashboard`

## Data Model Summary

### User

- account credentials
- profile image
- phone, gender, date of birth
- address object

### Doctor

- account credentials
- profile image
- speciality, degree, experience, fees
- availability flag
- address object
- booked slot map

### Appointment

- linked `userId` and `docId`
- embedded user and doctor snapshots
- slot date and time
- amount
- payment status
- cancellation status
- completion status

## Deployment Note

The repository already includes a root [vercel.json](./vercel.json) that maps:

- `frontend` to `/`
- `admin` to `/admin`
- `backend` to `/api`

The backend now supports both local development and Vercel-style export:

- local development: starts an HTTP server with `app.listen(...)`
- Vercel deployment: exports the Express app as the default module

## Important Implementation Notes

- Patient and dashboard apps both depend on `VITE_BACKEND_URL`.
- User and doctor images are uploaded to Cloudinary.
- Authentication tokens are stored in browser `localStorage`.
- Stripe payment flow redirects the patient back to the frontend for verification.
- Admin login is not stored in the database; it uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment variables.

## Current Limitations

- There is no root-level script to install or run all three apps together.
- Backend configuration assumes a specific MongoDB URI pattern ending with `/prescripto`.
- Stripe is implemented for the patient frontend flow only.
