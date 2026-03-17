# StressManage - Employee Stress Management System

A full-stack web application for tracking and monitoring employee wellness metrics and stress indicators. Built with React, Node.js, Express, and MongoDB.

## Features

### Employee Portal
- Log daily metrics: screen time, break time, meeting time, work time, afterHoursWork time
- View personal stress trend chart
- View and delete past entries
- Automatic stress score calculation

### HR Portal
- Organization-wide wellness dashboard
- Average metrics overview with bar chart
- Stress level distribution (pie chart)
- Search and filter all employee entries
- Export data to CSV

### Stress Score Formula
```
stressScore = (screenTime * 0.25) + (meetingTime * 0.20) + (workTime * 0.25) - (breakTime * 0.15) - (afterHoursTime * 0.15)
```
Score is normalized to a 0-100 scale.
- 0-30: Low Stress
- 30-60: Medium Stress
- 60+: High Stress

## Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS 4, Recharts
- **Backend**: Node.js, Express 4, Mongoose 8
- **Database**: MongoDB Atlas
- **Auth**: JWT (JSON Web Tokens), bcryptjs

## Prerequisites

- Node.js (v18 or later)
- A MongoDB Atlas account (free tier works)

## Quick Setup

### Option 1: Using the setup script (Windows)

1. Double-click `setup.bat`
2. If `.env` does not exist yet, the script creates it from `.env.example` and asks you to update `MONGO_URI`
3. Run `setup.bat` again after adding your MongoDB Atlas connection string

What `setup.bat` does for you:
- checks that Node.js and npm are installed
- verifies Node.js is version 18 or later
- can offer to install Node.js LTS automatically with `winget` if it is missing
- installs server dependencies
- installs client dependencies
- seeds the database
- starts the backend and frontend in separate terminal windows

### Option 2: Manual setup

1. Install server dependencies:
```
cd server
npm install
```

2. Install client dependencies:
```
cd client
npm install
```

3. Create a `.env` file in the project root (copy from `.env.example`):
```
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=stress_manage_jwt_secret_2024
PORT=5000
CLIENT_URL=http://localhost:5173
```

4. Seed the database with sample data:
```
npm run seed
```

5. Start the application:
```
npm run dev
```
This starts the backend (port 5000) and frontend (port 5173) concurrently.

## Demo Credentials

| Role     | Email              | Password    |
|----------|--------------------|-------------|
| Employee | alice@company.com  | password123 |
| Employee | bob@company.com    | password123 |
| Employee | carol@company.com  | password123 |
| Employee | david@company.com  | password123 |
| Employee | eva@company.com    | password123 |
| HR       | hr@company.com     | admin123    |

## API Endpoints

| Method | Endpoint          | Description                    | Auth     |
|--------|-------------------|--------------------------------|----------|
| POST   | /api/auth/login   | Login with email and password  | Public   |
| GET    | /api/auth/profile | Get current user profile       | Required |
| POST   | /api/metrics      | Log daily metrics              | Employee |
| GET    | /api/metrics/mine | Get own metric entries         | Employee |
| PUT    | /api/metrics/:id  | Update a metric entry          | Employee |
| DELETE | /api/metrics/:id  | Delete a metric entry          | Employee |
| GET    | /api/metrics/all  | Get all employee metrics       | HR only  |
| GET    | /api/metrics/stats| Get dashboard statistics       | HR only  |

## Project Structure

```
Stress Manage/
  .env
  .env.example
  setup.bat
  package.json
  server/
    server.js
    package.json
    seed.js
    config/
      db.js
    controllers/
      authController.js
      metricsController.js
    middleware/
      auth.js
    models/
      Metric.js
      User.js
    routes/
      auth.js
      metrics.js
  client/
    index.html
    vite.config.js
    package.json
    src/
      main.jsx
      App.jsx
      index.css
      context/
        AuthContext.jsx
      services/
        api.js
      components/
        DashboardLayout.jsx
        ProtectedRoute.jsx
        Sidebar.jsx
        StressBadge.jsx
      pages/
        LoginPage.jsx
        EmployeeDashboard.jsx
        LogMetrics.jsx
        EmployeeHistory.jsx
        HRDashboard.jsx
        HREmployees.jsx
```
