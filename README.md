# Adaptive Banking – One Experience for Every Customer

**FSDP Project | Group PS04-C06 | Ngee Ann Polytechnic**

An educational banking web application prototype focused on making the PayNow transfer journey easier to understand and use. This is a student project, not an official OCBC service.

## Main Features

- **Guided Mode:** Contextual, step-by-step tips during supported PayNow screens.
- **Voice Assistance:** Read Guided Tips aloud using browser text-to-speech, with playback/replay and speed controls.
- **AI Chatbot:** Banking help through a chat interface; attempts to match user questions with answers stored in the SQL Server `Faqs` table using Google GenAI, with SQL keyword-search fallback.
- **PayNow flow:** Login, recipient search, transfer amount, review and transfer status screens.

## Technology Stack

- Frontend: HTML, CSS, JavaScript, browser Web Speech API
- Backend: Node.js, Express
- Database: Microsoft SQL Server, `mssql` package
- Authentication: `bcryptjs`, JSON Web Tokens (`jsonwebtoken`)
- Chatbot: `@google/genai`, SQL Server FAQ data
- Deployment: GitHub Pages, Render (backend)

## Requirements

1. Node.js and npm installed.
2. Microsoft SQL Server running locally or on an accessible server.
3. SQL Server Management Studio (SSMS) or another SQL client to run the provided setup script.
4. A SQL Server login with permission to access the project database.
5. A modern browser with text-to-speech support for Voice Assistance.
6. Optional: Google Gemini API key for AI-based FAQ matching. The chatbot code also contains a SQL search fallback if the API call fails.

## Setup Instructions

### 1. Get the source code

Clone the repository or extract the submitted ZIP, then open a terminal in the project root (the folder containing `app.js` and `package.json`).

```bash
git clone https://github.com/ka1-tgd/FSDP-Project.git
cd FSDP-Project
```

If using the ZIP, skip the clone commands and open the extracted folder.

### 2. Install dependencies

```bash
npm install
```

### 3. Set up SQL Server

Open the SQL script in SSMS:

`database/PS04-C06 FSDP Project Database Set Up.sql`

Run it **only once on a fresh SQL Server instance**. The script creates `FSDPProject_db`, its tables and initial data. Running it again against an existing database may fail because the database/tables already exist.

Create or configure a SQL Server login with access to `FSDPProject_db`. Ensure SQL Server Authentication and TCP/IP connectivity are configured as required by your local SQL Server installation.

### 4. Configure environment variables

Copy `.env.example` to a new file named `.env` in the project root. Fill in your own local values:

```dotenv
PORT=3000
DB_USER=YOUR_SQL_LOGIN
DB_PASSWORD=YOUR_SQL_PASSWORD
DB_SERVER=YOUR_SQL_SERVER_NAME
DB_DATABASE=FSDPProject_db
DB_PORT=1433
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=1h
GOOGLE_API_KEY=YOUR_OPTIONAL_GEMINI_API_KEY
```

`DB_SERVER` must match your SQL Server configuration; a named SQL Server instance may require additional local TCP/IP configuration. `DB_PORT` must be a valid numeric TCP port used by your SQL Server. The application currently reads it with `parseInt`.

The chatbot uses the Google GenAI SDK, which commonly reads `GOOGLE_API_KEY` from the environment. If no working API key is configured, its code attempts SQL FAQ keyword matching as a fallback.

**Do not commit `.env`, real passwords, JWT secrets or API keys.** `.gitignore` already excludes `.env` files while allowing `.env.example`.

### 5. Start the application

```bash
node app.js
```

The terminal should show `Server running on port 3000` if `PORT` is not changed. Open:

**http://localhost:3000/html/login.html**

The Express server serves the `public` directory as static files, so `public/html/login.html` maps to `/html/login.html`.

### Demo Login Credentials

Use the following **demo-only** account to test the application:

| Field | Value |
|---|---|
| Login ID | `john123` (user-provided as `John123`) |
| Password | `123456` |
| Login URL | http://localhost:3000/html/login.html |

The provided SQL setup script seeds the `john123` account in `UserLogin`. The password shown above was supplied by the project team and should be verified after importing the database; the database stores a bcrypt password hash, not the plaintext password. These are demo credentials only—never use a personal password or real banking account. The login API uses bcrypt password verification and JWT authentication.

### 6. Explore the features

1. Log in using an available test account.
2. Navigate to the PayNow transfer flow.
3. Use the on-screen Guided Tips where available.
4. Use the speaker, replay and speed controls to hear the guidance.
5. Open the AI Assistant from the guidance popup to ask banking-related questions.

## Project Structure

```text
FSDP-Project/
├── app.js                         # Express server and API routes
├── dbConfig.js                    # SQL Server connection settings
├── package.json                   # Node.js dependencies
├── .env.example                   # Environment variable template
├── backend/
│   ├── controllers/               # Login, chatbot and transfer logic
│   ├── middleware/                # Validation and authentication
│   └── models/                    # Database access
├── database/
│   └── PS04-C06 FSDP Project Database Set Up.sql
└── public/
    ├── html/                      # App pages
    ├── css/                       # Stylesheets
    ├── scripts/                   # Frontend logic and guided mode
    └── images/                    # UI assets
```

## Troubleshooting

- **Page not found:** Use `http://localhost:3000/html/login.html`, not `/login.html` or `/pages/login.html`.
- **Missing dependencies:** Run `npm install` in the project root.
- **Database connection error / HTTP 500:** Check SQL Server is running, the database exists, the SQL login works, and `.env` values match your SQL Server instance and port.
- **Login rejected:** Confirm the test account exists in `UserLogin` and use its matching test password.
- **Chatbot cannot match a question:** Check the `Faqs` table and the optional Gemini API key; the fallback SQL search only matches relevant stored terms.
- **No spoken audio:** Try a browser supporting `speechSynthesis`, and check device volume and speech permissions/settings.

## Submission Notes

This repository includes source code and the database setup SQL file. `node_modules` and real `.env` secrets are intentionally excluded. This README describes the current codebase; it does not claim that automated tests or deployment have been completed.
