# Petronesia Portfolio Demo

Independent energy company profile demonstration using Next.js, Go Fiber, GORM, and SQLite/PostgreSQL. This is not an official Pertamina website.

Startup creates the schema and **does not insert any records**. There are no default administrator credentials. Fuel prices are frontend reference data dated 1 October 2026.

## Local development

```bash
cp .env.example .env
docker compose up --build -d
```

Frontend: `http://localhost:3000`. API health: `http://localhost:8080/api/health`.

Alternatively run `go run .` from `backend/`, and `npm ci` then `npm run dev` from `frontend/` in separate terminals. Manual backend startup reads `.env` from its current directory; export variables or use a separate untracked `backend/.env`.

SQLite is available locally. Production requires `DATABASE_URL`, `JWT_SECRET`, and exact HTTPS `ALLOWED_ORIGINS`. PostgreSQL failures stop startup without SQLite fallback. Configure `CLOUDINARY_URL` for uploads.

## Verification

```bash
cd backend
go test ./...
go build -o /tmp/petronesia-backend .
```

```bash
cd frontend
npm run lint
npx tsc --noEmit --incremental false
npm run build
npm run test:deployment
```

Tests use disposable databases and explicit fixtures. The legacy `backend/cmd/migrate` utility contains demo seeds for local use only; never run it against deployment databases.

## First administrator

After empty-state launch verification, securely export the target `DATABASE_URL` and run locally from `backend/`:

```bash
go run ./cmd/bootstrap-admin --username owner --name "Portfolio Owner"
```

The command prompts for a password without echoing it and refuses execution when any administrator already exists. It is excluded from deployment and never runs automatically.

## Deployment

Deployment targets are Vercel Hobby, Render Free, Neon Free, and Cloudinary Free. Set production environment variables through provider dashboards using `.env.example` as a reference. Private deployment notes remain local. Documentation, tests, local migration/bootstrap utilities, databases, and secrets stay out of deployment inputs. Free plans remain subject to quotas and provider changes.
