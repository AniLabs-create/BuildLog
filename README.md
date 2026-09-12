# BuildLog

> *"GitHub shows what you shipped. BuildLog shows how you grew."*

BuildLog is a developer building platform for students, beginner developers, hackathon participants, and independent builders to track what they build, what they learn, and how they grow.

## Features (V1)

- **Authentication** — Sign up, login, logout, JWT-protected routes, bcrypt-hashed passwords
- **Account setup** — 6-step onboarding wizard with live username availability
- **Profiles** — Display name, bio, college/branch/year, skills, avatar, GitHub/LinkedIn/portfolio
- **Projects** — Full CRUD with status, tech stack, links, and public/private visibility
- **Build logs** — The core feature: what you built, learned, problems faced, and what's next (create, edit, delete)
- **Developer timeline** — Chronological history of everything you've built
- **Build streak** — Server-calculated consecutive-day logging streak
- **User search** — Backend-driven search by username or display name
- **Follow system** — Follow public accounts; request-to-follow private accounts (accept/decline/cancel)
- **Notifications** — Follow requests, acceptances, and new followers with an unread badge
- **Home feed** — Activity from you + everyone you follow (project created/completed/deployed, new logs)
- **Public/private accounts** — Private profiles show an identity-only wall until approved
- **Public developer profile** — Shareable portfolio at `/u/:username`
- **Public project pages** — Recruiter-ready build journey at `/u/:username/:projectSlug`
- **Settings** — Edit profile, links, and visibility anytime

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite (local dev) / PostgreSQL (Neon, production)
- **Authentication**: JWT (Bearer tokens)

## Project Structure

```text
BuildLog/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (Button, ProjectStatus, BuildLogCard, Timeline, ...)
│   │   ├── layouts/          # RootLayout (NavBar + content + Footer)
│   │   ├── pages/            # Route views (Landing, Dashboard, PublicProfile, ...)
│   │   ├── types/            # TypeScript interfaces (User, Project, BuildLog, ...)
│   │   ├── hooks/            # Custom hooks (useAuth)
│   │   ├── services/         # Typed API clients (api, auth, projects, buildLogs, users)
│   │   ├── context/          # AuthContext (global auth state)
│   │   ├── utils/            # Helpers (cn, error extraction, slug)
│   │   ├── App.tsx           # Router setup
│   │   └── main.tsx          # Entry point
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routes/           # auth, projects, build_logs, stats, users
│   │   ├── models/           # SQLAlchemy models (User, Project, BuildLog)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic (streak calculation)
│   │   ├── utils/            # security (JWT/bcrypt), dependencies, slug
│   │   ├── database.py       # Engine + session setup
│   │   ├── config.py         # Env-based settings
│   │   └── main.py           # FastAPI app + CORS + routers
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv venv                 # first time only
venv\Scripts\activate               # Windows (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
copy .env.example .env              # then edit SECRET_KEY etc.
python -m uvicorn app.main:app --reload
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

By default the backend uses a local SQLite file (`buildlog.db`) so it runs with zero setup. To use PostgreSQL (e.g. Neon), set `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Quick test

With the backend running:

```bash
cd backend
python test_api.py    # exercises signup → login → project → log → streak → dashboard
```

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register, returns JWT + user |
| POST | `/api/auth/login` | — | Login (username or email) |
| GET | `/api/auth/me` | ✅ | Current user profile |
| GET/POST | `/api/projects` | ✅ | List / create own projects |
| GET | `/api/projects/{id}` | — | Project details |
| PUT/DELETE | `/api/projects/{id}` | ✅ | Update / delete (owner only) |
| GET/POST | `/api/projects/{id}/logs` | GET —, POST ✅ | Project build logs |
| PUT/DELETE | `/api/logs/{id}` | ✅ | Update / delete log (owner only) |
| GET | `/api/stats/streak` | ✅ | Server-side streak |
| GET | `/api/stats/timeline` | ✅ | Chronological activity |
| GET | `/api/stats/dashboard` | ✅ | Aggregated dashboard data |
| GET | `/api/users/check-username` | — | Username availability |
| PUT | `/api/users/me` | ✅ | Update own profile |
| GET | `/api/users/search?q=` | ✅ | Search developers |
| GET | `/api/users/{username}` | — | Public profile (privacy-aware) |
| GET | `/api/users/{username}/projects` | — | Public project list (privacy-aware) |
| GET | `/api/users/{username}/projects/{slug}` | — | Public project + build journey |
| POST/DELETE | `/api/users/{username}/follow` | ✅ | Follow (or request) / unfollow (or cancel) |
| GET | `/api/follow-requests` | ✅ | Pending follow requests |
| POST | `/api/follow-requests/{id}/accept` | ✅ | Accept a request |
| POST | `/api/follow-requests/{id}/decline` | ✅ | Decline a request |
| GET | `/api/users/{username}/followers` | — | Follower list |
| GET | `/api/users/{username}/following` | — | Following list |
| GET | `/api/notifications` | ✅ | Notifications + unread count |
| POST | `/api/notifications/{id}/read` | ✅ | Mark one as read |
| POST | `/api/notifications/read-all` | ✅ | Mark all as read |
| GET | `/api/feed` | ✅ | Home activity feed |

## Frontend Routes

| Route | Page |
|-------|------|
| `/` | Landing |
| `/login`, `/signup` | Auth |
| `/setup` | First-time onboarding |
| `/home` | Activity feed |
| `/search` | Find developers |
| `/notifications` | Notifications + follow requests |
| `/settings` | Account settings |
| `/dashboard` | Projects dashboard |
| `/projects/new`, `/projects/:id`, `/projects/:id/edit`, `/projects/:id/log/new` | Project management (owner) |
| `/u/:username` | Public developer profile |
| `/u/:username/:projectSlug` | Public project page |

## Deployment (free tier)

- **Frontend** → Vercel (set `VITE_API_URL` to your backend URL)
- **Backend** → Render (start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
- **Database** → Neon PostgreSQL (set `DATABASE_URL`, generate a strong `SECRET_KEY`, set `ALLOWED_ORIGINS` to your frontend URL)
