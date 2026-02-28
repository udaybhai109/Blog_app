# TASH

Minimal literary blog built with Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- Clean serif-first literary UI with warm light theme + dark mode toggle
- Home page listing all posts
- Dynamic post pages by slug
- SEO setup (metadata, Open Graph, Twitter cards, `sitemap.xml`, `robots.txt`, JSON-LD)
- Prisma + PostgreSQL integration
- REST API routes:
  - `GET /api/posts`
  - `GET /api/posts/[slug]`
  - `POST /api/posts` (admin only)
  - `DELETE /api/posts/[slug]` (admin only)
- Admin dashboard at `/admin`:
  - Password login with env-based admin password
  - Markdown editor + live preview
  - Cloudinary image upload
  - Embed link support (YouTube, Instagram, X)
  - Publish and delete posts

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Cloudinary (unsigned upload preset)

## Environment Variables

Copy `.env.example` to `.env` and set values:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/tash?schema=public"
ADMIN_PASSWORD="change-this-password"
ADMIN_SESSION_SECRET="change-this-session-secret"
NEXT_PUBLIC_SITE_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-unsigned-upload-preset"
```

## Local Development

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

If Node/npm are not installed globally, this project also supports local portable tools in `.tools`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\run-local.ps1
```

Stop local PostgreSQL:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-local-db.ps1
```

## Prisma Migration Workflow

### Local

```bash
npx prisma migrate dev --name <migration_name>
```

### Production (Vercel)

```bash
npx prisma migrate deploy
```

`npm run vercel-build` runs:

1. `prisma generate`
2. `prisma migrate deploy`
3. `next build`

## Deploy to Vercel

1. Push this project to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Add all required environment variables in Vercel Project Settings.
4. Ensure Build Command is `npm run vercel-build`.
5. Deploy.

## Project Structure

```text
app/
  admin/
  api/
    admin/
    posts/
  posts/[slug]/
components/
lib/
prisma/
```
