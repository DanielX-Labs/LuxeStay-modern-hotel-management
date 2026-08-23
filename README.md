# LuxeStay Hotel Booking System

LuxeStay is a full-stack hotel reservation and operations platform with a guest-facing Next.js application, a separate Next.js admin panel, and an Express/MongoDB backend.

The upgraded release supports date-based availability, concurrency-safe booking, pay-at-hotel reservations, PDF invoices, transactional email, client cancellation, and protected hotel-staff workflows.

## Current software upgrade

### Reservation integrity and availability

- Availability is calculated for the requested check-in/check-out interval instead of permanently marking a room as booked.
- Overlapping active reservations are rejected by the backend.
- An atomic room reservation lock prevents simultaneous requests from booking the same room for overlapping dates.
- Cancelling or completing a reservation releases its date interval.
- Room searches exclude reservations that conflict with the selected stay dates.

### Booking references and pay at hotel

- Every confirmed reservation receives a unique reference such as `BK-2026-000124`.
- Every invoice receives a linked reference such as `INV-2026-000124`.
- References are stored in MongoDB and displayed in the client and admin dashboards.
- New reservations use `Pay at Hotel` with an initial payment status of `Pending`.
- Authorized staff can confirm payment and change its status to `Paid`.

Booking statuses remain simple:

```text
Pending -> Confirmed -> Checked In -> Checked Out
                  \-> Cancelled
                  \-> No Show
```

Payment status follows `Pending -> Paid`. No refund workflow or online payment gateway is included.

### PDF invoices

- A PDF invoice is generated and stored after a successful reservation.
- The unique invoice ID and Cloudinary reference remain attached to the booking.
- The protected invoice endpoint streams a real `application/pdf` document.
- Client and admin dashboards open invoices in the browser or Adobe Acrobat PDF viewer.
- Users download or print through the viewer toolbar.
- Original invoices remain available after cancellation.

Invoices contain the booking and invoice IDs, guest details, hotel and room information, dates, nights, rate, total, booking date, booking status, payment method, and payment status.

### Transactional email

All email uses a shared Nodemailer transporter configured for Brevo SMTP:

- login and account verification codes;
- password-reset and account-security messages;
- reservation confirmations;
- invoice delivery and resending;
- cancellation confirmations.

Booking email failure does not reverse a successful reservation. The invoice remains available from the dashboard.

### Client dashboard

Guests can view upcoming, completed, and cancelled reservations; inspect booking and payment details; open, download, or print invoices; and cancel an eligible reservation with a reason.

Cancellation is validated by the backend. A reservation cannot be cancelled if it belongs to another user or is already cancelled, checked in, checked out, or completed.

### Admin dashboard

Authorized administrators can:

- search reservations by Booking ID;
- view guest, room, stay, amount, status, payment, invoice, and cancellation details;
- open and print PDF invoices;
- resend invoice email;
- confirm payment and advance valid booking statuses;
- cancel eligible reservations;
- manage rooms and guest accounts;
- update room details without uploading replacement images.

Existing room images are preserved during text-only updates. They are replaced only when an administrator explicitly uploads new files.

### Notifications and logging

- Client actions use the existing notification helper.
- Admin actions use Sonner success and error notifications.
- Backend HTTP traffic is written to the server terminal.
- Admin traffic is labelled `[ADMIN REQUEST]`.
- Protected operations also produce `[ADMIN AUDIT]` entries with the actor, action, result, status, and duration.
- The admin panel proxies `/api/v1/*` through Next.js, making calls visible in the admin and backend development terminals.

## Project structure

```text
luxestay/
|-- frontend/                 Guest Next.js app (port 3034)
|   |-- components/           Rooms, profiles, bookings, auth, and layout
|   |-- pages/                Guest routes
|   |-- styles/               Guest styling
|   `-- utils/                API, authentication, and notifications
|-- admin-panel/              Admin Next.js app (port 3033)
|   |-- pages/                Admin routes
|   `-- src/                  Components, hooks, store, and utilities
|-- backend/                  Express API (port 3035)
|   `-- src/
|       |-- configs/          Brevo, Cloudinary, CORS, and responses
|       |-- controllers/      Auth, users, rooms, bookings, and reviews
|       |-- database/         MongoDB connection and admin bootstrap
|       |-- middleware/       Authentication, uploads, limits, and logging
|       |-- models/           Mongoose schemas
|       |-- routes/           Versioned API routes
|       `-- services/         Invoice and booking-email services
|-- render.yaml               Render backend Blueprint
|-- DEPLOYMENT.md             Deployment checklist
`-- README.md
```

## Technology

| Area | Technology |
| --- | --- |
| Guest and admin UI | Next.js 16, React 19, Ant Design |
| Admin notifications | Sonner |
| API | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Authentication | JWT access/refresh tokens, bcryptjs |
| File storage | Cloudinary |
| Email | Nodemailer with Brevo SMTP |
| Security | Helmet, CORS allowlist, rate limiting |
| Logging | Winston and Morgan |
| Testing | Jest and Supertest |

## Requirements

- Node.js 20.9 or newer
- npm
- MongoDB (local or Atlas)
- Cloudinary account
- Brevo SMTP credentials

## Local installation

Install each application independently:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin-panel
npm install
```

Copy the environment templates on Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item admin-panel/.env.example admin-panel/.env
```

### Backend environment

Configure MongoDB, JWT, Cloudinary, URLs, default-admin values, and Brevo SMTP in `backend/.env`:

```env
PORT=3035
API_URL=http://localhost:3035
CLIENT_URL=http://localhost:3034
ADMIN_URL=http://localhost:3033

BREVO_EMAIL_TRANSPORT=smtp
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=your_smtp_login
BREVO_SMTP_KEY=your_smtp_key
BREVO_SENDER_EMAIL=no-reply@example.com
BREVO_SENDER_NAME=LuxeStay
SUPPORT_EMAIL=support@example.com
```

Never expose MongoDB, JWT, Cloudinary, admin, or SMTP credentials through `NEXT_PUBLIC_*` variables.

### Guest environment

```env
NEXT_PUBLIC_API_URL=http://localhost:3035
```

### Admin environment

The admin uses a same-origin Next.js proxy so calls appear in its terminal:

```env
NEXT_PUBLIC_API_URL=
BACKEND_API_URL=http://localhost:3035
```

`BACKEND_API_URL` is private server configuration and must point to the deployed backend in production.

## Run locally

Open three terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

```bash
cd admin-panel
npm run dev
```

| Service | Address |
| --- | --- |
| Guest application | `http://localhost:3034` |
| Admin panel | `http://localhost:3033` |
| Backend API | `http://localhost:3035/api/v1` |
| Health check | `http://localhost:3035/health` |

The health endpoint returns:

```json
{ "status": "ok", "service": "luxestay-api" }
```

## Booking flow

```text
Search rooms
  -> choose dates
  -> backend availability check
  -> atomic reservation lock
  -> confirmed booking and unique IDs
  -> PDF invoice generation and storage
  -> confirmation and invoice email
  -> client and admin dashboards
  -> pay at hotel
  -> staff marks payment Paid
  -> Checked In
  -> Checked Out
```

Cancellation flow:

```text
Open booking
  -> validate ownership and status
  -> capture cancellation reason
  -> mark Cancelled without deleting
  -> release reserved dates
  -> retain Booking ID and invoice
  -> send cancellation email
```

## Booking API

All endpoints are mounted under `/api/v1`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/rooms/:id/availability` | Check availability for a date interval. |
| `POST` | `/placed-booking-order/:id` | Create a protected reservation. |
| `GET` | `/get-user-booking-orders` | List the authenticated guest's bookings. |
| `GET` | `/booking/:id` | View an authorized booking. |
| `GET` | `/booking/:id/invoice` | Retrieve invoice metadata. |
| `GET` | `/booking/:id/invoice?format=pdf` | Stream an authorized inline PDF invoice. |
| `PUT` | `/cancel-booking-order/:id` | Cancel an eligible guest booking. |
| `GET` | `/get-all-booking-orders` | List/search bookings as an administrator. |
| `PUT` | `/updated-booking-order/:id` | Update payment or booking status. |
| `PUT` | `/admin/booking/:id/cancel` | Cancel a booking as an administrator. |
| `POST` | `/admin/booking/:id/resend-invoice` | Queue invoice email redelivery. |

Authentication, room, user, and review routes retain the existing `/api/v1` structure.

## Backend protections

The backend is authoritative for:

- authentication and blocked-account status;
- administrator authorization;
- booking ownership;
- overlapping-date availability;
- concurrent double-booking prevention;
- valid booking-status transitions;
- cancellation eligibility;
- payment-status updates;
- invoice access.

## Development commands

```bash
# Backend
cd backend
npm run dev
npm test
npm run lint
npm start

# Guest application
cd frontend
npm run dev
npm run build
npm run lint

# Admin application
cd admin-panel
npm run dev
npm run build
```

## Production deployment

- Deploy the backend using `render.yaml` or another Node.js host.
- Deploy `frontend` and `admin-panel` as separate Next.js applications.
- Set backend `CLIENT_URL` and `ADMIN_URL` to the exact HTTPS origins.
- Set guest `NEXT_PUBLIC_API_URL` to the deployed backend origin.
- Leave admin `NEXT_PUBLIC_API_URL` empty and set its private `BACKEND_API_URL` to the backend origin.
- Keep MongoDB, Cloudinary, JWT, default-admin, and Brevo secrets in backend environment settings.
- Verify health, registration, OTP delivery, booking, PDF viewing, invoice resend, cancellation, payment confirmation, check-in, and check-out after deployment.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete deployment checklist.

## Scope

LuxeStay records hotel reservations and pay-at-hotel payment status. It does not process card payments, issue refunds, operate door-access systems, or replace the hotel's legal and identity-verification procedures.
