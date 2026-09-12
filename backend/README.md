# BuildLog Backend API

FastAPI backend and PostgreSQL/SQLite database layer for BuildLog.

---

## Architecture Overview

```text
backend/
├── app/
│   ├── models/           # SQLAlchemy 2.0 ORM models (User, Project, BuildLog)
│   ├── schemas/          # Pydantic v2 schemas for request validation & serialization
│   ├── routes/           # API endpoints (health, auth, projects, logs)
│   ├── services/         # Business logic layer
│   ├── utils/            # Helper utilities
│   ├── config.py         # Application settings loaded via Pydantic
│   ├── database.py       # Engine, sessionmaker, and get_db dependency
│   └── main.py           # FastAPI entry point, CORS, and lifespan table creation
├── .env.example          # Environment variables template
├── requirements.txt      # Python dependencies
└── README.md
```

---

## Quickstart

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (already initialized for local dev):
```bash
cp .env.example .env
```

By default, `DATABASE_URL` uses SQLite (`sqlite:///./buildlog.db`) for immediate zero-friction local development.
To switch to Neon PostgreSQL:
```ini
DATABASE_URL=postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require
```

### 3. Run the Development Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Interactive API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
