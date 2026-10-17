# HRMS Backend

Production-ready REST API backend for a Human Resource Management System.

**Stack:** Java 17 · Spring Boot 3.3 · Spring Security (JWT) · Spring Data JPA · PostgreSQL 16 · Flyway · Maven · Docker

---

## 1. Modules implemented

| Module | Capabilities |
|---|---|
| **Auth** | Login, refresh-token rotation, logout, employee onboarding (creates login + HR profile together) |
| **Employees** | CRUD, search/filter/pagination, self-profile (`/me`), deactivate/reactivate (soft offboarding) |
| **Departments / Designations** | CRUD (soft delete) |
| **Attendance** | Check-in / check-out, auto work-hours calculation, half-day detection, history by date range |
| **Leave Management** | Apply, approve/reject (by manager), cancel, overlap prevention, per-type annual balance tracking with auto-credit-back on cancellation |
| **Payroll** | Generate payslip prorated by attendance for a given month, mark as paid, payslip history |

Cross-cutting: role-based access control (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`), centralized exception handling with a consistent JSON envelope, request validation, OpenAPI/Swagger docs, JPA auditing (created/updated by & at), pagination caps, CORS config.

---

## 2. Project layout

```
hrms-backend/
├── src/main/java/com/hrms/
│   ├── config/          # Security, OpenAPI, JPA auditing, web config
│   ├── security/         # JWT service/filter, UserDetailsService, auth entry points
│   ├── entity/           # JPA entities + enums
│   ├── repository/       # Spring Data repositories
│   ├── dto/request/       # Request payloads (Java records + validation)
│   ├── dto/response/      # Response payloads
│   ├── service/           # Interfaces
│   ├── service/impl/      # Business logic
│   ├── controller/        # REST controllers
│   ├── exception/         # Custom exceptions + @RestControllerAdvice
│   └── util/               # ApiResponse / PageResponse envelopes
├── src/main/resources/
│   ├── application.yml            # base config (env-var driven)
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── db/migration/               # Flyway SQL migrations (V1, V2, V3)
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 3. Running locally

### Option A — Docker (recommended, zero local setup)

```bash
cp .env.example .env      # edit JWT_SECRET at minimum
docker compose up --build
```

API will be live at `http://localhost:8080/api`, Swagger UI at `http://localhost:8080/api/swagger-ui.html`.

### Option B — Local Maven + local Postgres

```bash
# 1. Start Postgres (or use the one in docker-compose.yml alone):
docker run -d --name hrms-pg -e POSTGRES_DB=hrms_db -e POSTGRES_USER=hrms_user \
  -e POSTGRES_PASSWORD=hrms_password -p 5432:5432 postgres:16-alpine

# 2. Run the app (Flyway migrates the schema automatically on boot)
mvn spring-boot:run
```

Requires JDK 17+ and Maven 3.8+ installed locally. (No Maven Wrapper is bundled — add one with
`mvn -N io.takari:maven:wrapper -Dmaven=3.9.9` if you'd like `./mvnw`.)

---

## 4. First-time setup — creating the first ADMIN user

There's no seeded user (by design — no default credentials shipped to production). Insert the first
admin directly via SQL after the app has booted and Flyway has created the schema:

```sql
INSERT INTO users (email, password_hash, role, is_enabled)
VALUES ('admin@company.com', '$2a$12$<bcrypt-hash>', 'ADMIN', true);
```

Generate a BCrypt hash (strength 12) with any BCrypt tool, e.g.:
```bash
python3 -c "import bcrypt; print(bcrypt.hashpw(b'YourPassword123', bcrypt.gensalt(12)).decode())"
```

From there, log in as that admin via `POST /auth/login` and use `POST /employees` (as ADMIN/HR) to
onboard every subsequent employee — this creates their login **and** HR profile in one call.

---

## 5. Key API endpoints

All routes are prefixed with `/api` (see `server.servlet.context-path`).

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Get access + refresh token |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | Public | Revoke refresh token |
| POST | `/employees` | ADMIN, HR | Onboard employee |
| GET | `/employees/me` | Any authenticated | My profile |
| GET | `/employees` | ADMIN, HR, MANAGER | Search/paginate |
| PATCH | `/employees/{id}/deactivate` | ADMIN, HR | Offboard |
| POST | `/attendance/check-in` | Any authenticated | Check in |
| POST | `/attendance/check-out` | Any authenticated | Check out |
| POST | `/leaves` | Any authenticated | Apply for leave |
| PATCH | `/leaves/{id}/decision` | ADMIN, HR, MANAGER | Approve/reject |
| GET | `/leaves/balance` | Any authenticated | My leave balance |
| POST | `/payroll/generate` | ADMIN, HR | Generate payslip |

Full interactive documentation: **`/api/swagger-ui.html`** once the app is running.

Every response is wrapped in a consistent envelope:
```json
{ "success": true, "message": "Success", "data": { ... }, "timestamp": "..." }
```

---

## 6. Design notes / trade-offs

- **JWT + rotating refresh tokens**: access tokens are short-lived (1h default) and stateless; refresh
  tokens are persisted server-side so they can be revoked on logout, and are rotated on every use to
  limit replay-attack impact.
- **Soft deletes** for Department/Designation (an `is_active` flag) because employees may still
  reference them historically — hard deletes would break referential integrity or orphan records.
- **Payroll prorating** is based on `PRESENT`/`HALF_DAY` attendance days ÷ total days in the month. A
  fuller implementation would also credit approved paid-leave days as payable; that's a natural next
  iteration once leave-attendance sync is added.
- **Employee code generation** (`EMP00001`, ...) is a simple counter for MVP purposes; a production
  system at scale would use a dedicated sequence or a more collision-resistant scheme under load.
- **Validation** lives on DTOs (Jakarta Bean Validation) so bad input never reaches the service layer.
- **`ddl-auto: validate`** — schema is *only* ever changed via Flyway migrations, never by Hibernate
  auto-DDL, which is the only sane approach for a "real" production system.

---

## 7. Not yet included (natural next steps)

- Unit/integration test suite (H2 test profile is already wired up in `application-test.yml`)
- Email notifications (leave decisions, payslip generation)
- File upload for profile images / documents (currently just a URL field)
- Admin-level password reset flow
- Audit log / activity feed
- Rate limiting on `/auth/login`
- React frontend (this backend is designed to pair with one — CORS is pre-configured for
  `localhost:3000` / `localhost:5173`)

---

## 8. Environment variables

See `.env.example` for the full list. The important ones:

| Variable | Purpose | Default |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Postgres connection | see `.env.example` |
| `JWT_SECRET` | HMAC signing key — **must** be changed for production | placeholder (insecure) |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | Token TTLs in ms | 1h / 7d |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `localhost:3000,5173` |
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod` | `dev` |
