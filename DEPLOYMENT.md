# LuxeStay deployment

LuxeStay is deployed as three independent services from one repository:

| Service | Provider | Root directory |
| --- | --- | --- |
| Express API | Render | `backend` (configured by root `render.yaml`) |
| Guest application | Vercel | `frontend` |
| Admin application | Vercel | `admin-panel` |

## 1. Prepare external services

Before deploying, create:

- a production MongoDB Atlas database;
- a Cloudinary account and upload credentials;
- a Brevo SMTP account and verified sender address;
- strong administrator credentials.

MongoDB Atlas Network Access must allow connections from Render. Use a restricted configuration appropriate for your plan; if dynamic outbound addresses require `0.0.0.0/0`, compensate with a strong database user/password and least-privilege database access.

## 2. Deploy the backend to Render

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Render, choose **New → Blueprint** and connect the repository.
3. Render reads `render.yaml` and creates the `luxestay-api` web service.
4. Enter every value marked `sync: false`:
   - `MONGODB_URI`
   - `CLIENT_URL` (the stable guest Vercel origin)
   - `ADMIN_URL` (the stable admin Vercel origin)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - all `CLOUDINARY_*` values
   - `BREVO_SENDER_EMAIL`, `SUPPORT_EMAIL`, `BREVO_SMTP_LOGIN`, and `BREVO_SMTP_KEY`
5. Allow Render to generate the access-token and refresh-token secrets.
6. Do not create a `PORT` variable; Render injects it automatically.
7. Deploy and open `https://YOUR-RENDER-SERVICE.onrender.com/health`.

The health endpoint should return a `200` response similar to:

```json
{
  "status": "ok",
  "service": "luxestay-api",
  "uptime": 42
}
```

The backend connects to MongoDB before accepting traffic and exits when required production variables are missing. Render uses `/health` to decide when a new instance is ready.

## 3. Deploy the guest frontend to Vercel

1. Import the repository as a new Vercel project.
2. Set **Root Directory** to `frontend`.
3. Keep the detected framework as **Next.js**.
4. Add this environment variable to Production, Preview, and Development as needed:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

5. Deploy and record the stable production URL.
6. Put that exact origin in Render’s `CLIENT_URL`, without a trailing slash, and redeploy the backend.

## 4. Deploy the admin panel to Vercel

1. Import the repository as a second Vercel project.
2. Set **Root Directory** to `admin-panel`.
3. Keep the detected framework as **Next.js**.
4. Configure the same public API origin:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

5. Deploy and record the stable production URL.
6. Put that exact origin in Render’s `ADMIN_URL`, without a trailing slash, and redeploy the backend.

## 5. CORS and preview deployments

`CLIENT_URL` and `ADMIN_URL` accept comma-separated origins. Add only preview origins that need backend access:

```env
CLIENT_URL=https://luxestay.example.com,https://approved-preview.vercel.app
ADMIN_URL=https://admin.luxestay.example.com,https://approved-admin-preview.vercel.app
```

Avoid wildcard CORS for authenticated applications.

## 6. Verify production

1. Confirm the Render health endpoint returns `200`.
2. Open the guest application and confirm featured rooms and `/rooms` load.
3. Register, verify, sign in, refresh the page, and sign out.
4. Request a password reset and confirm email delivery.
5. Place and cancel a test booking.
6. Sign in to the admin panel and confirm dashboard metrics load.
7. Create or edit a room and confirm Cloudinary images render publicly.
8. Approve or reject a booking and confirm the guest sees the new status.
9. Check browser developer tools for CORS, mixed-content, or failed API requests.
10. Confirm no private environment value appears in either Vercel bundle.

## Operational notes

- Render free services can spin down after inactivity; the first request after sleep may be slower.
- `API_URL` is optional on Render because asset helpers fall back to Render’s `RENDER_EXTERNAL_URL`.
- Changing a `NEXT_PUBLIC_*` value requires a new Vercel build because it is bundled at build time.
- Rotate any credential exposed in source, logs, screenshots, or repository history.
