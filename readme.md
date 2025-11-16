# JumboJolt Web

Platform for logging "switch" actions, sharing news, and running missions with gamified rewards. The app supports anonymous or Firebase-backed sign-ins, real-time updates, moderation workflows, and GDPR-friendly privacy controls.

<img width="1917" height="1066" alt="Screenshot 2025-11-16 145712" src="https://github.com/user-attachments/assets/4ee77a3b-feec-4cf4-b54b-91eb9a9fbfaa" />

<img width="1919" height="1072" alt="Screenshot 2025-11-16 145753" src="https://github.com/user-attachments/assets/3fdf9d6d-4b69-42d3-a2ca-49ff3e4f78ee" />

<img width="1919" height="1060" alt="image" src="https://github.com/user-attachments/assets/30af75cb-9c91-47f4-8ec9-3bbb6c840814" />

<img width="1918" height="1067" alt="image" src="https://github.com/user-attachments/assets/e45d5d87-9181-4946-a72d-0e4474e3dc75" />

<img width="1919" height="1067" alt="image" src="https://github.com/user-attachments/assets/766602e9-6cbf-4c90-8b3a-5becb6e20fb7" />

## Project layout
- `client/`: React 18 + TypeScript + Vite front end (Wouter routing, React Query, Tailwind/Radix UI, shadcn-like components).
- `server/`: Express API with Drizzle ORM on PostgreSQL, WebSocket events, SMTP email, MinIO/S3 uploads, and Firebase Admin helpers.
- `shared/`: Cross-cutting config and the Drizzle schema used by both the API and migrations.

## Tech stack
- Front end: Vite, React 18, TypeScript, Wouter, React Query, Tailwind CSS with Radix UI primitives, Framer Motion, Recharts, Firebase client SDK.
- Back end: Node.js, Express, Drizzle ORM, PostgreSQL, WebSockets (`ws`), Nodemailer SMTP, Firebase Admin, MinIO/S3 client.
- Tooling: TypeScript, tsx runtime, esbuild bundling, Drizzle Kit migrations, Tailwind, Concurrently for dual dev servers.

## Getting started
1) Prereqs: Node 18+, npm, PostgreSQL (with `pgcrypto` for `gen_random_uuid()`), optional MinIO/S3 bucket for uploads, SMTP creds for email, Firebase project for auth.
2) Configure env: `cp env.example .env` then fill database URL, `VITE_FRONTEND_URL`, `VITE_API_BASE_URL` (API defaults to `3006`), SMTP, Firebase, and MinIO settings.
3) Install deps: `npm install`.
4) Database: create your database and apply the schema with `npm run db:push`. Open Drizzle Studio with `npm run db:studio` if you want to inspect tables.
5) Run locally:
   - Full stack: `npm run dev:all` (Vite client + Express API; API listens on `0.0.0.0:3006`).
   - Or separate: `npm run dev` (API only) and `npm run dev:client` (Vite).
   Hit `http://localhost:3006/api/health` to verify the server.
6) Production build: `npm run build` then `npm start` to serve the built client (`dist/public`) and bundled API from `dist/index.js`.

## Environment notes
- SMTP is required for password resets and transactional emails.
- Firebase keys are needed for phone/email/OTP flows; anonymous and secret-key login also exist for low-friction onboarding.
- MinIO settings are optional; if disabled, stub or update `server/services/minio` to match your storage provider before enabling evidence uploads.

## Screenshots / recording
- Drop screenshots or a short demo video into `attached_assets/screenshots/` (or any path) and link them here. Example placeholders you can replace once captured:
  - `![Home](attached_assets/screenshots/home.png)`
  - `![Missions](attached_assets/screenshots/missions.png)`
  - `[Demo video](attached_assets/screenshots/demo.mp4)`

## Key features (high level)
- Multi-mode auth: Firebase phone/email/OTP, anonymous handles, secret-key login, recovery keys, and backup codes.
- Switch logging with evidence uploads, moderator approvals, and admin oversight for suggestions, feedback, and targets.
- Missions, rewards, and leaderboards (weekly/monthly) to gamify participation.
- News feed with voting, sharing, and commenting plus WebSocket-powered real-time broadcasts.
- Privacy/GDPR center for data export and account deletion.

## Useful scripts
- `npm run dev:all` — start Vite + API together.
- `npm run db:push` — push Drizzle schema to Postgres.
- `npm run build` / `npm start` — build and serve production bundle.
- `npm run db:studio` — inspect data in Drizzle Studio.

## Assumptions & bonus touches
- Assumes a PostgreSQL instance reachable via `VITE_DATABASE_URL` and with `pgcrypto` available for UUID generation.
- Email (SMTP) and Firebase projects are expected to be provisioned by the operator; secrets live in `.env`.
- Uploads target an S3-compatible bucket (MinIO helper provided) for evidence images linked to switch logs.
- Extra polish: anonymous-to-registered migration, GDPR request logging, moderator/admin panels, and WebSocket echo channel for live UI updates.

