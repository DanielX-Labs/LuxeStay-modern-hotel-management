# LuxeStay

LuxeStay is a full-stack hotel room discovery, booking, and operations platform. It combines a guest-facing Next.js application, a separate Next.js administration panel, and an Express API backed by MongoDB.

Guests can discover current rooms, filter the collection, open detailed room pages, create accounts, request reservations, manage their booking history, and review completed stays. Hotel administrators get a dedicated operational dashboard for rooms, guests, booking requests, availability, and account management.

LuxeStay is designed for room inventory and reservation workflows. It is not a payment processor, property access-control system, accounting platform, or substitute for the hotel’s legal, safety, and identity-verification procedures.

## Problems LuxeStay solves

Hotels and guests lose time when room details, reservation requests, availability, and customer records are spread across calls, messages, and spreadsheets. LuxeStay gives both sides a consistent source of truth.

- **Stale room information:** The guest applications fetch room inventory from the API during server rendering and refresh it in the browser every 30 seconds and whenever the tab regains focus.
- **Difficult room discovery:** Room type, price, capacity, pet, breakfast, and facility information helps guests compare suitable stays.
- **Unclear availability:** Every room carries an explicit `available`, `unavailable`, or `booked` status.
- **Manual reservation tracking:** Booking requests move through defined pending, approved, rejected, cancelled, review, and completed states.
- **Scattered guest records:** Profiles, verification state, bookings, reviews, and account status remain connected to one guest account.
- **Unsafe administrative actions:** Authentication, blocked-user checks, and administrator authorization protect operational endpoints.
- **Slow hotel oversight:** The admin dashboard summarizes guests, inventory, availability, reservations, and items that need attention.
- **Unreliable feedback:** Loading states, empty states, validation, notifications, and controlled API responses make outcomes visible.

## Platform features

### Authentication and accounts

- Register with a username, name, email, phone number, password, profile information, and optional avatar.
- Sign in using email/password and complete email-code verification when required.
- Use short-lived access tokens and longer-lived refresh tokens.
- Refresh an authenticated session without signing in again.
- Sign out and clear the active browser session.
- Request and complete password resets through time-limited tokens.
- Request verified email and password changes using one-time codes.
- Send and complete account email verification.
- Prevent blocked users from accessing protected operations.

### Guest room discovery

- View the featured-room collection on the home page.
- Browse the complete room inventory.
- Refresh current room information on initial load, every 30 seconds, and when returning to the browser tab.
- Preserve the last successful room response during a brief API outage.
- Filter rooms by type, nightly price, pets, breakfast, and facilities.
- Open room details by readable slug.
- View room images, price, size, capacity, amenities, description, and current status.
- Use responsive pagination for larger room collections.

### Reservations

- Select future stay dates for an available room.
- Create a pending booking request from an authenticated account.
- View personal booking history and current booking status.
- Cancel an eligible personal booking.
- Prevent invalid or past booking dates through backend validation.
- Let administrators approve, reject, advance, or complete booking workflows.

### Reviews

- Read public reviews associated with a room.
- Add a review through an authenticated, eligible account.
- Edit a review owned by the signed-in guest.
- Associate reviews with the relevant booking and room.

### Guest profiles

- View and edit personal profile information.
- Upload or replace an avatar through Cloudinary-backed upload middleware.
- Change passwords and email addresses through verification flows.
- Review reservation history from one profile area.
- Delete the signed-in account when appropriate.

### Hotel administration

- View a live overview of guests, rooms, room readiness, and reservations.
- Create rooms with multiple Cloudinary-hosted images.
- Edit room details, pricing, facilities, images, and featured status.
- Mark room inventory as available, unavailable, or booked.
- Delete rooms and their managed Cloudinary assets.
- Search and paginate guest and booking records.
- Inspect guest details and account status.
- Block, unblock, create, edit, or delete users through protected admin operations.
- Review and update booking requests from the operations dashboard.

### Application experience

- Separate guest and administrator applications with independent deployments.
- Responsive Next.js 16 and React 19 interfaces.
- Ant Design components, Tailwind utilities in the admin panel, and shared branded assets.
- Loading skeletons, empty states, filters, pagination, confirmation dialogs, and notifications.
- Production security headers, CORS allowlists, request rate limiting, and structured logging.
- Health endpoint for deployment and uptime checks.

## How the system works

### 1. Authentication

1. A guest registers or submits email/password credentials.
2. Express validates the request and bcrypt verifies the password hash.
3. Login verification can require a one-time code sent through the configured email provider.
4. The API issues signed access and refresh tokens after successful authentication.
5. The browser stores the active session data and attaches the access token to protected API requests.
6. Authentication middleware resolves the user and rejects expired, invalid, or blocked sessions.
7. Admin-only middleware verifies the account role before operational actions proceed.

Passwords are hashed before storage. Private JWT, database, Cloudinary, and email credentials stay in the backend environment only.

### 2. Discovering rooms

1. Next.js requests featured or complete room data while rendering the guest page.
2. The Express room controller queries MongoDB and maps a safe room response.
3. The browser displays room images, rates, capacity, facilities, and status.
4. Client-side refreshes keep the open page current without discarding the last successful response during a transient outage.
5. Guests can filter the returned collection locally and open details using the room slug.

### 3. Placing a reservation

1. An authenticated guest opens an available room.
2. The guest selects future booking dates.
3. Backend validation checks the room, user, date values, and booking constraints.
4. MongoDB creates the reservation with a `pending` status.
5. The booking appears in the guest’s history and the administrator’s order list.
6. An administrator reviews the request and updates its status.
7. Completed stays can move into the review workflow.

### 4. Managing hotel inventory

1. An administrator submits room information and up to five images.
2. Authentication and admin middleware authorize the request.
3. Upload middleware sends images to Cloudinary.
4. MongoDB stores room details and hosted image references.
5. Public room endpoints immediately expose the updated inventory.
6. Browser refresh intervals propagate changes to active guest pages.

### 5. Managing users and operations

1. The admin dashboard requests protected operational totals.
2. Administrators open paginated room, guest, or booking lists.
3. Each mutation passes authentication, blocked-user, and admin-role checks.
4. The backend returns a consistent result code, title, message, and data payload.
5. The interface refreshes affected dashboard data and shows the operation result.

## Workflow summary

```text
Guest opens LuxeStay
        |
        +-- Browse rooms --------> filter and view details
        |                               |
        |                         room is available
        |                               |
        +-- Register / sign in ---------+-- submit booking dates
        |                                      |
        |                                  PENDING
        |                                      |
        |                          Admin reviews request
        |                         /          |          \
        |                   APPROVED      REJECTED    CANCELLED
        |                       |
        |                   COMPLETED ----> guest review
        |
        +-- Manage profile and booking history

Administrator signs in
        |
        +-- Dashboard overview
        +-- Rooms and availability
        +-- Booking operations
        +-- Guests and account status
        +-- Administrator profile
```

## Database collection diagram

LuxeStay uses MongoDB collections for users, rooms, bookings, and reviews.

```text
User
 ├── creates ─────────────────────────> Room
 ├── places ──────────────────────────> Booking
 └── writes ──────────────────────────> Review

Room
 ├── room_images[]
 ├── extra_facilities[]
 ├── room_status
 └── Booking[]
          ├── booking_dates[]
          ├── booking_status
          ├── booking_by ─────────────> User
          └── reviews ────────────────> Review

Review
 ├── room ────────────────────────────> Room
 └── user / booking ownership
```

## Project structure

```text
luxestay/
├── frontend/                         guest-facing Next.js application
│   ├── components/                   home, room, profile, auth, and layout UI
│   ├── hooks/                        data fetching and responsive helpers
│   ├── pages/                        guest routes and Next.js application shell
│   ├── public/                       logos, room images, and public assets
│   ├── store/                        Redux application state
│   ├── styles/                       global guest-site styling
│   ├── utils/                        API, authentication, and notification helpers
│   ├── next.config.js                Next.js configuration
│   └── vercel.json                   Vercel Next.js declaration
├── admin-panel/                      hotel operations Next.js application
│   ├── pages/                        Next.js admin routes
│   ├── public/                       admin branding and public assets
│   ├── src/components/               dashboard, room, booking, and user UI
│   ├── src/hooks/                    admin interface helpers
│   ├── src/store/                    Redux application state
│   ├── src/utils/                    API, authentication, theme, and notifications
│   ├── tailwind.config.js            admin Tailwind design configuration
│   └── vercel.json                   Vercel Next.js declaration
├── backend/                          Express REST API
│   ├── src/configs/                  responses, CORS, email, Cloudinary, and API helpers
│   ├── src/controllers/              authentication, rooms, users, bookings, and reviews
│   ├── src/database/                 MongoDB connection and default-admin bootstrap
│   ├── src/lib/                      date, booking, and asset helpers
│   ├── src/middleware/               auth, uploads, rate limits, errors, and logging
│   ├── src/models/                   Mongoose user, room, booking, and review schemas
│   ├── src/routes/                   versioned REST routes
│   ├── docs/                         API references and historical development data
│   └── server.js                     local and Render process entry with graceful shutdown
├── render.yaml                       Render backend Blueprint
├── .gitignore                        secrets and generated-file protection
├── DEPLOYMENT.md                     deployment notes
└── README.md                         project documentation
```

Each application has its own package manifest and lockfile. Install and run commands from the relevant directory.

## Tools and their purpose

| Tool | Purpose |
| --- | --- |
| Next.js 16 | Guest and administrator rendering, routing, production builds, and Vercel deployment. |
| React 19 | Interactive room, booking, profile, user, and dashboard interfaces. |
| Express 4 | REST API, middleware pipeline, health checks, and application routing. |
| MongoDB | Persistent users, rooms, bookings, reviews, and operational state. |
| Mongoose | Schemas, validation, references, queries, and document middleware. |
| Redux Toolkit | Small shared client-state stores for both Next.js applications. |
| Ant Design | Forms, tables, dialogs, results, skeletons, uploads, and dashboard controls. |
| Tailwind CSS | Responsive utility styling for the administrator application. |
| Axios | Browser and server communication with the Express API. |
| JSON Web Token | Access-token and refresh-token authentication. |
| bcryptjs | Password hashing and credential verification. |
| Cloudinary | Hosted room images and user avatars. |
| Multer | Multipart room-image and avatar request handling. |
| Nodemailer / Brevo | Verification, password reset, and account-security email delivery. |
| Helmet | HTTP security headers. |
| express-rate-limit | General and authentication-specific request throttling. |
| Winston / Morgan | Application and HTTP request logging. |
| Jest / Supertest | Backend tests and HTTP integration checks. |

## Requirements

Install or create the following before running LuxeStay:

- Node.js 20.9 or newer
- npm
- MongoDB Atlas or a local MongoDB deployment
- Cloudinary account for room and avatar uploads
- Brevo SMTP credentials or another supported mail configuration

## Run on localhost

### 1. Install dependencies

Install each application separately from the repository root:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ../admin-panel
npm install
```

### 2. Configure the environments

Copy the sanitized templates.

On macOS or Linux:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin-panel/.env.example admin-panel/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
Copy-Item admin-panel/.env.example admin-panel/.env
```

Replace every placeholder in `backend/.env`. The two browser applications need only the public API location:

```env
NEXT_PUBLIC_API_URL=http://localhost:3035
```

Only a public API URL belongs in a `NEXT_PUBLIC_*` variable. Database, JWT, Cloudinary, administrator, and email secrets must remain in `backend/.env`.

### 3. Start the applications

Open three terminals from the repository root:

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

### 4. Confirm the backend

Open `http://localhost:3035/health`. A healthy process returns:

```json
{ "status": "ok" }
```

## Local addresses

| Service | Address |
| --- | --- |
| Guest frontend | `http://localhost:3034` |
| Admin panel | `http://localhost:3033` |
| Backend API | `http://localhost:3035/api/v1` |
| Health check | `http://localhost:3035/health` |
| Guest sign in | `http://localhost:3034/auth/login` |
| Guest registration | `http://localhost:3034/auth/registration` |
| Rooms | `http://localhost:3034/rooms` |
| Guest profile | `http://localhost:3034/profile` |
| Admin sign in | `http://localhost:3033/auth/login` |
| Admin dashboard | `http://localhost:3033/main/dashboard` |

## REST API

All application endpoints are mounted under `/api/v1`. Room lists, room details, featured rooms, and room reviews are public. Account, booking, profile, and administrative mutations require authentication; operational routes additionally require an administrator account.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/registration` | Register a guest account. |
| `POST` | `/api/v1/auth/login` | Start the login and verification flow. |
| `POST` | `/api/v1/auth/login/verify-email` | Verify the login email code. |
| `POST` | `/api/v1/auth/logout` | Sign out an authenticated account. |
| `GET` | `/api/v1/auth/refresh-token` | Exchange a valid refresh token for fresh session credentials. |
| `POST` | `/api/v1/auth/forgot-password` | Request a password-reset email. |
| `POST` | `/api/v1/auth/reset-password/:token` | Complete a token-based password reset. |
| `GET` | `/api/v1/get-user` | Retrieve the authenticated profile. |
| `PUT` | `/api/v1/update-user` | Update the authenticated profile. |
| `PUT` | `/api/v1/avatar-update` | Upload a new profile avatar. |
| `GET` | `/api/v1/all-rooms-list` | List the complete room inventory. |
| `GET` | `/api/v1/featured-rooms-list` | List featured rooms. |
| `GET` | `/api/v1/get-room-by-id-or-slug-name/:id` | Retrieve room details by ID or slug. |
| `POST` | `/api/v1/placed-booking-order/:id` | Request a booking for a room. |
| `GET` | `/api/v1/get-user-booking-orders` | List the guest’s bookings. |
| `PUT` | `/api/v1/cancel-booking-order/:id` | Cancel an eligible guest booking. |
| `GET` | `/api/v1/get-room-reviews-list/:room_id` | List public reviews for a room. |
| `POST` | `/api/v1/room-review-add/:id` | Add an authenticated room review. |
| `PUT` | `/api/v1/edit-room-review/:review_id` | Edit a review owned by the guest. |
| `GET` | `/api/v1/dashboard` | Retrieve protected admin overview data. |
| `POST` | `/api/v1/create-room` | Create a room with uploaded images. |
| `PUT` | `/api/v1/edit-room/:id` | Update a room and its images. |
| `DELETE` | `/api/v1/delete-room/:id` | Delete a room. |
| `GET` | `/api/v1/all-users-list` | List users for administration. |
| `PUT` | `/api/v1/blocked-user/:id` | Block a user account. |
| `PUT` | `/api/v1/unblocked-user/:id` | Unblock a user account. |
| `GET` | `/api/v1/get-all-booking-orders` | List all booking requests for administration. |
| `PUT` | `/api/v1/updated-booking-order/:id` | Update a booking workflow status. |

## Development commands

Backend commands:

```bash
cd backend
npm run dev       # start Express with nodemon
npm run lint      # run backend ESLint
npm test          # run Jest and Supertest tests
npm run coverage  # generate test coverage
npm start         # start the production Node.js process
```

Guest frontend commands:

```bash
cd frontend
npm run dev       # start Next.js on port 3034
npm run lint      # run ESLint
npm run build     # create the production build
npm start         # start the production server
```

Admin panel commands:

```bash
cd admin-panel
npm run dev       # start Next.js on port 3033
npm run build     # create the production build
npm start         # start the production server on port 3033
```

## Security notes

- Environment files at every directory depth are ignored; sanitized `.env.example` files remain versioned.
- JWT, MongoDB, Cloudinary, SMTP, and default-admin credentials must never receive a `NEXT_PUBLIC_` prefix.
- Passwords are hashed with bcrypt using a work factor before storage.
- Access and refresh tokens use different secrets and expiration windows.
- Password-reset and email-verification tokens are hashed and expire after a limited period.
- One-time verification codes track purpose, expiration, attempts, and resend timing.
- Protected routes verify authentication, blocked status, and administrator role as appropriate.
- CORS accepts only configured guest and administrator origins.
- Helmet applies HTTP security headers and allows cross-origin hosted room assets.
- General and login-specific rate limits reduce abusive traffic.
- Upload middleware limits the accepted image workflow and stores media with Cloudinary.
- MongoDB and API errors pass through controlled response and error middleware.
- Logs, local uploads, environment files, deployment state, certificates, and database dumps are excluded from Git.

Rotate a credential immediately if it appears in source code, screenshots, chat messages, terminal output, logs, commits, or public history. Adding it to `.gitignore` does not remove it from earlier commits.

## Production deployment

The backend, guest frontend, and admin panel deploy independently. Render uses the root `render.yaml` Blueprint for the API, while each Next.js directory contains its own Vercel framework declaration. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete checklist.

### Deploy the backend

1. In Render, create a Blueprint deployment from the repository root; Render reads `render.yaml` and uses `backend` as the service root.
2. Configure every value marked `sync: false` in the Render dashboard.
3. Use production MongoDB, Cloudinary, JWT, administrator, and email credentials.
4. Set `CLIENT_URL` and `ADMIN_URL` to the exact HTTPS origins of the deployed applications.
5. Do not set `PORT`; Render injects it automatically. `API_URL` is optional because Render supplies `RENDER_EXTERNAL_URL`.
6. Deploy and confirm `/health` returns a successful service-status response.

### Deploy the guest frontend

1. Create a Vercel project with `frontend` as its root directory.
2. Keep the detected framework as Next.js.
3. Set `NEXT_PUBLIC_API_URL` to the deployed backend origin without `/api/v1`.
4. Deploy and add the resulting stable origin to the backend’s `CLIENT_URL`.

### Deploy the admin panel

1. Create a second Vercel project with `admin-panel` as its root directory.
2. Keep the detected framework as Next.js.
3. Set `NEXT_PUBLIC_API_URL` to the same deployed backend origin.
4. Deploy and add the resulting stable origin to the backend’s `ADMIN_URL`.

### Verify the deployment

1. Confirm the backend health endpoint.
2. Register, verify, sign in, refresh, and sign out a guest account.
3. Confirm featured and complete room lists load from the production API.
4. Place and cancel a test reservation.
5. Sign in to the admin application and confirm dashboard totals load.
6. Create or edit a room and verify guest pages receive the updated inventory.
7. Approve or reject a test booking and confirm its guest-visible status changes.
8. Upload an avatar and room image and verify the Cloudinary URLs render.
9. Test password reset, email verification, and account-security email delivery.
10. Confirm no secret appears in browser bundles, responses, logs, or source control.

## Important limitations

- LuxeStay records reservation requests but does not currently process payments.
- Booking approval is an administrative workflow rather than an automatic payment-backed confirmation.
- Room status is inventory-level state; it is not a full per-night channel-management calendar.
- Room and avatar availability depends on the configured Cloudinary account.
- Account-security emails depend on the configured SMTP provider.
- JWT session data is stored by the browser, so production deployments should enforce HTTPS and strong content-security practices.
- Deleting rooms, users, or Cloudinary assets can be permanent and should be restricted to authorized administrators.
