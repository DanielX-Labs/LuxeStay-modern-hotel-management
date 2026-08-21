# LuxeStay Admin Panel

The admin panel runs on Next.js 16 using the Pages Router.

## Requirements

- Node.js 20.9 or newer
- `NEXT_PUBLIC_API_URL` configured in `.env`

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3033](http://localhost:3033).

## Production

```bash
npm run build
npm start
```

The main routes are `/`, `/auth/login`, and `/main/[tab]`.
