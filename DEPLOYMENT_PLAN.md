# Portfolio Deployment Plan: Empty Database, Free Hosting

Confirmed 3 November 2026. Local project documentation, excluded from deployment inputs.

## 1. Outcome and confirmed decisions

Deploy Next.js on **Vercel Hobby**, the Go API on **Render Free**, PostgreSQL on **Neon Free**, and future image uploads on **Cloudinary Free**. Use provider subdomains and free plans, subject to quotas and provider changes.

- Create tables with **zero application records**, including administrators, audit logs, and fuel prices.
- Preserve corporate design, static copy, and repository images. Remove sample news, vacancies, dashboard records, and fabricated API fallbacks.
- Retain fuel prices as dated frontend reference data, without inserting them into the database or claiming they are live prices.
- Preserve agent Markdown, tests, and standalone migration utilities locally; exclude them from deployment.
- Create the first administrator only through an explicitly invoked local command after launch.
- Never import SQLite files, restore data, erase existing databases, or run migration/seeding/bootstrap utilities during deployment.

## 2. Application preparation

### Database and authentication

Separate automatic GORM schema creation from seeding. Require PostgreSQL `DATABASE_URL`, explicit `JWT_SECRET`, and exact HTTPS `ALLOWED_ORIGINS` in production. Fail startup on connection errors without a SQLite fallback. Move demo seed code into the excluded standalone migration utility; do not compile it into the API.

Provide the local command `go run ./cmd/bootstrap-admin --username owner --name "Portfolio Owner"` from `backend/`. Require an explicitly exported target `DATABASE_URL`, securely prompt and confirm a password, hash it, create a superadmin, and refuse bootstrap if an administrator already exists. Never run it on deployment or include it in deployment inputs.

Empty means empty at launch. Later contact submissions, authentication attempts, and administrator actions may create legitimate records.

### Frontend

Use real API data for public/admin news and vacancies. Empty responses show empty states; failures show retry controls. Initialize dashboard counters to zero. Keep static corporate content as presentation defaults without manufacturing CMS records. Persist only fields changed from their loaded CMS baseline. Version the browser cache to discard stale demonstration content.

Keep local fuel prices and region/category filters labelled with their dataset reference date, **1 October 2026**. Make no widget API requests or writes. Leave the database-writing fuel scheduler inactive and report its status truthfully; historical fallback data must not claim live synchronization success.

Fix the unsupported Next.js configuration property, resolve lint errors, retain TypeScript validation, and display an independent portfolio-demo notice.

### Uploads and networking

Use the official Cloudinary Go SDK behind the authenticated upload endpoint. Preserve multipart field `image` and response fields `success`, `message`, `url`, and `filename`. Enforce 5 MB, validate image contents/extensions/dimensions, return HTTPS delivery URLs, keep credentials server-side, and provide no production filesystem fallback.

Allow the configured API origin in frontend CSP. Restrict CORS to configured production origins; allow localhost in development. Add read-only `GET /api/health`, returning 200 for a successful database ping and 503 otherwise. Use it for Render and Compose health checks.

## 3. Packaging and configuration

Both Docker ignore files and frontend `.vercelignore` exclude project Markdown, agent directories, tests/fixtures, standalone migration/bootstrap utilities, database files/sidecars, local uploads, secrets, caches, and development outputs. Preserve assets, dependency manifests/lockfiles, and required build configuration.

Keep this plan and the project summary at the repository root, outside both service build roots. Deploy Vercel initially with CLI from `frontend/` so upload exclusions are explicit. `.gitignore` and Render build filters do not remove tracked deployment inputs. Inspect Docker contexts and final artifacts separately. Do not delete preserved local files or rewrite history.

| Service | Configuration |
| --- | --- |
| Render Free | `APP_ENV=production`, `PORT=8080`, unique `JWT_SECRET`, `DATABASE_URL`, exact HTTPS `ALLOWED_ORIGINS`, `CLOUDINARY_URL` |
| Vercel Hobby | `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.onrender.com/api` at build time |
| Neon Free | A new empty PostgreSQL database using its supplied TLS connection string |
| Cloudinary Free | Server credential URL in Render only; no automatic image uploads |

## 4. Verification and acceptance

- Backend tests/build, frontend type checking, lint, and production build pass.
- Fresh startup and restart create tables and leave all seven application tables empty.
- Invalid production database configuration fails without creating SQLite files.
- Read-only public/health requests leave tables empty. Do not perform production login/contact/upload smoke tests before zero-row acceptance.
- Public/admin dynamic sections handle empty/error states without sample records.
- Fuel filters/reference prices work with no database records or writes.
- CMS loading inserts nothing; saving one changed field persists only that field.
- Explicit bootstrap creates exactly the first administrator and refuses another bootstrap.
- Validate upload rejection, success, missing credentials, and provider failures in a disposable environment without production uploads.
- Inspect deployment inputs/artifacts for excluded project Markdown, tests, migration/bootstrap code, databases, secrets, and plan documents.
- Keep tests locally, using explicit fixtures and disposable databases. Run write smoke tests against a separate test database.

## 5. Rollout runbook

1. Complete local implementation and verification. Create free Neon and Cloudinary accounts/projects without importing data or uploading images. Choose a Neon region close to Render Singapore where available.
2. Create/link a Vercel Hobby project rooted at `frontend/` to reserve its stable production hostname. Use that exact origin in Render CORS. Do not enable automatic Git deployment for the initial CLI workflow.
3. Connect the project to the user's chosen Git repository if Render requires it. Repository destination: https://github.com/RPriago/Company-project-redesign.git. Account authentication is required before pushing.
4. Deploy Render using `render.yaml`: Dockerfile `backend/Dockerfile`, context `backend`, Free instance, Singapore, health path `/api/health`, no disk/worker/scheduled job. Configure the variables above in provider dashboards, not committed files.
5. Confirm healthy backend startup and run the read-only Neon SQL check below. Every count must be zero. Investigate nonzero counts; do not erase rows to disguise an incorrect database target/startup path.
6. Set production `NEXT_PUBLIC_API_URL` in Vercel. From `frontend/`, authenticate/link with Vercel CLI, deploy a preview with `npx vercel`, then deploy with `npx vercel --prod` after preview verification. API URL/CSP changes require a rebuild. Add exact preview origins explicitly if preview API access is needed; do not allow all Vercel subdomains.
7. Verify public navigation, empty news/careers, dated fuel data, retries, CSP/CORS, and inaccessible development files. Record final URLs and variable names only in ignored `DEPLOYMENT_URLS.local.md`. Do not create an administrator during launch.

```sql
SELECT 'admins' AS table_name, COUNT(*) AS rows FROM admins
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'job_vacancies', COUNT(*) FROM job_vacancies
UNION ALL SELECT 'site_contents', COUNT(*) FROM site_contents
UNION ALL SELECT 'contact_messages', COUNT(*) FROM contact_messages
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT 'fuel_prices', COUNT(*) FROM fuel_prices;
```

Only when the owner later chooses to populate the system, securely export the target `DATABASE_URL` locally and invoke the bootstrap command above. Passwords are never passed as command arguments. This intentionally ends the zero-record state; login can create audit records.

Render Free can sleep after inactivity and has ephemeral local storage. Display wake-up/loading information, avoid artificial keep-alive traffic, monitor quota dashboards/logs, and add no paid resources or scheduled services. Roll back only to application versions preserving no-seeding startup; never reset the database or restore seeded startup behavior as a rollback.

## Provider references

- [Vercel Hobby](https://vercel.com/docs/plans/hobby)
- [Vercel exclusions](https://vercel.com/docs/deployments/vercel-ignore)
- [Render Free limitations](https://render.com/docs/free)
- [Neon pricing](https://neon.com/pricing)
- [Cloudinary pricing](https://cloudinary.com/pricing)
- [Cloudinary Go SDK](https://cloudinary.com/documentation/go_integration)

## Deployment status

Provider resources, administrator accounts, and production records have not been created by implementation. Actual rollout requires authenticated provider access, a repository destination, and deployment secrets. Local verification results are reported in the implementation handoff.
