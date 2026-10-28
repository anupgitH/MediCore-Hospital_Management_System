![image_alt](https://github.com/anupgitH/MediCore-Hospital_Management_System/blob/797f3eef3602a29dcc28e5832b3e6a3b4217de89/HospitalManagementSystem.png)

# MediCore — Hospital Management System

A full-stack starter project for hospital operations using React + Vite, Spring Boot, and MySQL.

## Features
- Dashboard overview
- Patient CRUD (create, list, search, delete)
- Doctor directory
- Appointment booking and status tracking
- REST API with validation and CORS
- MySQL configuration with environment-variable support
- Demo-friendly frontend with responsive layout

> This is an educational starter project, not a certified clinical system. Do not use real patient data without a security, privacy, backup, and compliance review.

## Requirements
- Java 17+
- Maven 3.9+ (or use your local Maven)
- Node.js 20+
- MySQL 8+

## 1. Database
Create a database:
```sql
CREATE DATABASE medicore_hms;
```

## 2. Backend
```bash
cd backend
cp .env.example .env
```
Set database credentials in `src/main/resources/application.properties` (or environment variables), then run:
```bash
mvn spring-boot:run
```
API base URL: `http://localhost:8080/api`
Health check: `http://localhost:8080/api/health`

Environment variables supported:
- `DB_URL` (default `jdbc:mysql://localhost:3306/medicore_hms`)
- `DB_USERNAME` (default `root`)
- `DB_PASSWORD` (default `change_me`)
- `CORS_ORIGINS` (default `http://localhost:5173`)

## 3. Frontend
In a second terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`.

## API endpoints
- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/{id}`
- `DELETE /api/patients/{id}`
- `GET /api/doctors`
- `POST /api/doctors`
- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/{id}/status`

## Important next steps for production
Add authentication and role-based authorization (Admin, Receptionist, Doctor, Nurse, Pharmacist), audit logs, encrypted backups, secure session/token handling, rate limiting, input validation review, consent and retention policies, and security testing. Do not expose medical records without authorization.
