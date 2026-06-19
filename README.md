# AMC-FNFAO Database

<div align="center">
  <img src="public/logo.png" alt="Logo" width="400" height="400">
</div>

***Abinoojiyak Bigiiwewag — Our Children are Coming Home.***

## About The Application

The AMC-FNFAO Database is a system to track information about clients who are served at the First Nations Family Advocate Office.

### Built With

* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [PostgreSQL](https://www.postgresql.org/) on DigitalOcean
* [Auth.js](https://authjs.dev/) for authentication

## Environment Variables

Create `.env.local` for local development:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
AUTH_SECRET=generate-a-long-random-string
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional seed overrides
ADMIN_EMAIL=admin@fnfao.local
ADMIN_PASSWORD=changeme123

# Optional email
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@example.com

# Optional file storage path (defaults to ./storage/attachments)
ATTACHMENTS_DIR=./storage/attachments
```

Generate `AUTH_SECRET`:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

1. Create a DigitalOcean Managed PostgreSQL database
2. Link it to your App Platform app (sets `DATABASE_URL`)
3. Run the seed script once:

```sh
npm run db:seed
```

This creates all tables and a default admin user.

## Local Development

```sh
npm install
npm run db:seed
npm run dev
```

Sign in at `/login` with the admin credentials from your env vars.

## DigitalOcean Deployment

1. Create an App Platform app from this repo
2. Add a Managed PostgreSQL database and link it to the app
3. Set environment variables:
   - `AUTH_SECRET` (required, secret)
   - `NEXT_PUBLIC_APP_URL` (your app URL, build + run)
4. Deploy the app
5. Run `npm run db:seed` against the production database once (from a machine that can reach it, or use DO console)

You do **not** need Supabase or Clerk.

## Usage

```sh
npm run dev      # development
npm run build    # production build
npm start        # run production build
```
