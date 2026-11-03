# Dockerize Petronesia Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap the Petronesia Go backend and Next.js frontend into reproducible, production-ready Docker containers orchestrated with Docker Compose for easy local execution and server deployment.

**Architecture:** Multi-stage Docker builds for both services. Go backend compiles to a lightweight static binary running on Alpine with persistent SQLite/upload volumes; Next.js frontend compiles using standalone output for minimal image footprint. Docker Compose binds both services to a shared network with configurable port mapping and environment variables.

**Tech Stack:** Docker, Docker Compose, Go 1.26 (Alpine multi-stage), Node.js 20/Alpine (Next.js 16 standalone), SQLite / PostgreSQL compatibility.

**Spec:** User request: "wrap project ini ke docker agar mudah dijalankan dan di deploy nantinya".

## Global Constraints

- Backend must compile with `CGO_ENABLED=0` for pure Go static execution without host libc dependencies.
- Frontend must leverage Next.js standalone build mode (`output: "standalone"`) to keep image sizes small.
- Database state (`petronesia.db`) and uploaded media (`/uploads`) must persist via named Docker volumes.
- Docker compose configuration must allow zero-config execution out of the box (`docker compose up --build`).
- Maintain existing environment variable fallback defaults in both frontend and backend.

## Review Focus

1. Persistensi SQLite: restart container tidak boleh menghilangkan data database (`/app/data/petronesia.db`).
2. Persistensi upload file: gambar yang diunggah ke `/app/uploads` harus tetap ada saat container di-recreate.
3. Build-time vs Runtime API URL di Next.js: `NEXT_PUBLIC_API_URL` harus diteruskan sebagai build arg.
4. Standalone Next.js assets: static assets (`public` dan `.next/static`) harus disalin dengan tepat ke runner image.
5. Perbaikan kompilasi Go: field `TokenVersion` pada `models.Admin` dan signature `GenerateToken` harus konsisten sebelum build image.

---

### Task 1: Fix Backend Compilation Blocker

**Files:**
- Modify: `backend/models/admin.go`
- Modify: `backend/utils/jwt.go`

**Interfaces:**
- Consumes: Existing references in `controllers/authController.go` (`admin.TokenVersion`, `GenerateToken(admin.ID, admin.Username, admin.Role, tokenVersion)`)
- Produces: `TokenVersion int` field in `models.Admin` struct; `GenerateToken(userID uint, username, role string, tokenVersion int) (string, error)` in `utils` package

- [ ] **Step 1: Update `models/admin.go` to add `TokenVersion`**
  Tambahkan field `TokenVersion int` dengan tag `json:"token_version" gorm:"default:1"` pada struct `Admin`.

- [ ] **Step 2: Update `utils/jwt.go` signature and claims**
  Tambahkan `TokenVersion int` pada `JWTClaims` struct, dan ubah signature `GenerateToken` menjadi:
  `func GenerateToken(userID uint, username, role string, tokenVersion int) (string, error)`

- [ ] **Step 3: Run backend build verification**
  Run: `cd backend && CGO_ENABLED=0 go build -o /tmp/petronesia-backend-test .`
  Expected: Exit code 0, binary created without compilation errors.

- [ ] **Step 4: Clean up temporary binary**
  Run: `rm -f /tmp/petronesia-backend-test`
  Expected: Clean workspace.

---

### Task 2: Backend Containerization

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/.dockerignore`

**Interfaces:**
- Consumes: `backend/main.go`, `go.mod`, `go.sum`
- Produces: Minimal production Docker image running Petronesia backend on port 8080 with volume support for `/app/data` and `/app/uploads`

- [ ] **Step 1: Create `backend/.dockerignore`**
  Ignore local binary, `.git`, `.DS_Store`, SQLite db files, and node/editor caches.

- [ ] **Step 2: Create `backend/Dockerfile`**
  Implement multi-stage build:
  - Stage 1 (builder): `golang:alpine` to run `go mod download` and `CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o petronesia-backend .`
  - Stage 2 (runner): `alpine:latest` with `ca-certificates` and `tzdata`, creating directories `/app/data` and `/app/uploads`, exposing port 8080, running `./petronesia-backend`.

- [ ] **Step 3: Verify Dockerfile syntax**
  Run: `docker build --check backend` or validate Dockerfile structure.

---

### Task 3: Frontend Containerization & Standalone Mode

**Files:**
- Modify: `frontend/next.config.ts`
- Create: `frontend/Dockerfile`
- Create: `frontend/.dockerignore`

**Interfaces:**
- Consumes: Next.js source code, `package.json`
- Produces: Production standalone Docker image exposing port 3000

- [ ] **Step 1: Enable standalone output in `frontend/next.config.ts`**
  Add `output: "standalone"` to `nextConfig`.

- [ ] **Step 2: Create `frontend/.dockerignore`**
  Ignore `node_modules`, `.next`, `.git`, `.DS_Store`, local log files.

- [ ] **Step 3: Create `frontend/Dockerfile`**
  Implement multi-stage build:
  - Stage 1 (deps): `node:20-alpine` with `package.json` and `package-lock.json`, running `npm ci`.
  - Stage 2 (builder): Copy dependencies and source, accept `ARG NEXT_PUBLIC_API_URL`, run `npm run build`.
  - Stage 3 (runner): Minimal `node:20-alpine`, copy `.next/standalone`, copy `.next/static` to `.next/standalone/.next/static`, copy `public` to `.next/standalone/public`, expose port 3000, execute `node server.js`.

---

### Task 4: Docker Compose Orchestration

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`

**Interfaces:**
- Consumes: `backend/Dockerfile`, `frontend/Dockerfile`
- Produces: Unified orchestrator connecting frontend (port 3000) and backend (port 8080) with bridge network and persistent volumes.

- [ ] **Step 1: Create `.env.example`**
  Tulis template environment variable yang jelas untuk deployment (`PORT`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL`, `DB_TYPE`, dll).

- [ ] **Step 2: Create `docker-compose.yml`**
  Definisikan service `backend` dan `frontend`:
  - `backend`: build context `./backend`, port `8080:8080`, environment `SQLITE_FILE=/app/data/petronesia.db`, volumes `backend_data:/app/data` dan `backend_uploads:/app/uploads`.
  - `frontend`: build context `./frontend`, build arg `NEXT_PUBLIC_API_URL=http://localhost:8080/api`, port `3000:3000`, depends_on `backend`.
  - Volumes named: `backend_data`, `backend_uploads`.

- [ ] **Step 3: Validate Compose configuration syntax**
  Run: `docker compose config` (apabila daemon aktif) atau verifikasi syntax YAML.

---

### Task 5: End-to-End Verification and Deployment Guide

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: Completed Docker setup
- Produces: Verified deployment documentation and one-command run instructions.

- [ ] **Step 1: Document Docker execution in `README.md`**
  Tambahkan panduan singkat menjalankan via Docker:
  ```bash
  # Menjalankan seluruh sistem (frontend & backend)
  docker compose up --build -d
  ```

- [ ] **Step 2: Final Verification Checklist**
  Verifikasi checklist:
  - Backend compiles cleanly with `CGO_ENABLED=0`
  - Dockerfile backend dan frontend tervalidasi
  - Volumes persistent terpasang
  - Compose configuration terstruktur rapi dan siap deploy
