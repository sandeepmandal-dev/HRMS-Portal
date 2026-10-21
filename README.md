# HRMS Portal

A web application for managing employees, attendance, leave and payroll, with separate access for Admin, HR, Manager and Employee users.

<!--
Add screenshots here (save images in docs/screenshots/):

![Dashboard](docs/screenshots/dashboard.png)
-->

## About

HRMS Portal covers the everyday work of an HR team. Employees check in and request leave, managers approve their team's requests, HR handles onboarding and payroll, and admins manage the company structure.

The project has two parts: a Spring Boot REST API (`hrms-backend`) and a React app (`hrms-frontend`).

## Features

- **Login and roles:** secure sign-in with Admin, HR, Manager and Employee access levels
- **Employees:** onboarding, search, editing, deactivation, and a self-service profile page
- **Departments and designations:** manage the company structure
- **Attendance:** daily check-in and check-out with work hours calculated automatically
- **Leave:** apply, cancel, approve or reject, with yearly balances per leave type
- **Payroll:** payslips based on attendance, mark as paid, and a company-wide payroll list

## Tech Stack

- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA
- **Database:** PostgreSQL 16 with Flyway migrations
- **Frontend:** React 18, Vite, Tailwind CSS
- **Tools:** Maven, Docker, Swagger (OpenAPI)

## Getting Started

### Requirements

- Node.js 18 or newer
- Docker Desktop, **or** JDK 17, Maven and PostgreSQL

### 1. Clone the project

```bash
git clone https://github.com/<your-username>/hrms-portal.git
cd hrms-portal
```

### 2. Start the backend

Using Docker (starts the database and the API together):

```bash
cd hrms-backend
docker compose up --build
```

Without Docker: create an empty database named `hrms_db`, then run:

```powershell
# PowerShell
cd hrms-backend
$env:DB_PASSWORD = "your-postgres-password"
mvn spring-boot:run
```

```bash
# macOS / Linux
cd hrms-backend
DB_PASSWORD='your-postgres-password' mvn spring-boot:run
```

The database tables are created automatically on the first start. When the log shows `Started HrmsBackendApplication`, the API is ready at `http://localhost:8080/api`.

### 3. Add test users

The app has no default users. Load the sample accounts from `docs/seed-test-data.sql`.

With Docker (run from the project root):

```bash
docker cp docs/seed-test-data.sql hrms-postgres:/tmp/seed.sql
docker exec hrms-postgres psql -U hrms_user -d hrms_db -f /tmp/seed.sql
```

With a local database, open the file in pgAdmin's Query Tool and run it.

### 4. Start the frontend

```bash
cd hrms-frontend
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env
npm run dev
```

Open **http://localhost:5173** and sign in.

## Test Accounts

| Role     | Email                | Password       |
|----------|----------------------|----------------|
| Admin    | admin@hrms.test      | Admin@123      |
| HR       | hr@hrms.test         | Hr@12345       |
| Manager  | manager@hrms.test    | Manager@123    |
| Employee | employee@hrms.test   | Employee@123   |

These accounts are for local testing only. Do not use them on a shared or live server.

## What Each Role Can Do

- **Employee:** check in and out, apply for leave, view own payslips, edit own profile
- **Manager:** everything an employee can do, plus view the employee list and approve leave for their team
- **HR:** everything a manager can do, plus onboard employees, manage departments and designations, approve all leave, and run payroll
- **Admin:** full access, including deactivating departments and designations

## API Documentation

With the backend running, open Swagger UI at:

http://localhost:8080/api/swagger-ui.html

To try a protected endpoint, call `POST /auth/login`, copy the `accessToken` from the response, click **Authorize**, and paste the token.

## Project Structure

```
hrms-portal/
├── hrms-backend/     Spring Boot API, Flyway migrations, Dockerfile, docker-compose.yml
├── hrms-frontend/    React app
├── docs/             Test data script
└── README.md
```

## Configuration

The backend reads these environment variables:

| Variable | Purpose |
|----------|---------|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Database connection |
| `JWT_SECRET` | Key used to sign login tokens. Change it before any real deployment |
| `CORS_ALLOWED_ORIGINS` | Frontend addresses allowed to call the API |
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod` |

## Known Limitations

- Only one check-in and check-out per employee per day
- No password reset or change-password feature yet
- No automated tests yet
- The frontend is not included in Docker

## Roadmap

- Automated tests for backend and frontend
- Multiple attendance sessions per day
- Password reset
- Docker image for the frontend

## Author

**<your-name>** - [GitHub](https://github.com/<your-username>)
