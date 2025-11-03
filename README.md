# MediConnect

A full-stack medical application with React frontend, FastAPI backend, and PostgreSQL database.

## 🏗️ Architecture

MediConnect uses a microservices architecture with Docker containerization:

- **Frontend**: React 19 + Vite + React Router
- **Backend**: FastAPI (Python 3.12) + Uvicorn
- **Database**: PostgreSQL (latest)
- **Admin Tool**: pgAdmin 4

## 🐳 Docker Configuration

### Services Overview

The application runs in **4 Docker containers** orchestrated by Docker Compose:

| Service  | Container Name | Port | Purpose                       |
| -------- | -------------- | ---- | ----------------------------- |
| Frontend | `frontend-dev` | 5173 | React/Vite development server |
| Backend  | `backend-dev`  | 8000 | FastAPI REST API              |
| Database | `postgres-dev` | 5432 | PostgreSQL database           |
| pgAdmin  | `pgadmin-dev`  | 5050 | Database administration UI    |

All services communicate through a shared bridge network: `med-network`.

### Prerequisites

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

### 🚀 Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/ISZ-AiR/MediConnect.git
   cd MediConnect
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:

   ```bash
   FRONTEND_URL="localhost:5173"
   VITE_APP_API_URL="http://localhost:8000"
   ```

3. **Start all services**

   ```bash
   docker compose up --build
   ```

   Or run in detached mode:

   ```bash
   docker compose up -d --build
   ```

4. **Access the application**

   - Frontend: http://localhost:5173
   - Backend API docs: http://localhost:8000/docs
   - pgAdmin: http://localhost:5050

5. **Login with default admin credentials**

   ```
   Email:    admin@mediconnect.com
   Password: admin123
   ```

   ⚠️ **Note**: A default admin user is automatically created on first startup for testing purposes. Change these credentials in production!

   See [DEFAULT_ADMIN.md](backend/DEFAULT_ADMIN.md) for more details.

### 📁 Project Structure

```
MediConnect/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   └── api/
│   │       ├── main.py          # API router
│   │       └── routers/
│   │           └── health_router.py  # Health check endpoint
│   ├── Dockerfile.dev           # Backend container definition
│   └── pyproject.toml           # Python dependencies (Poetry)
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Main app component
│   │   ├── pages/
│   │   │   └── Homepage.jsx     # Landing page with health check
│   │   ├── services/
│   │   │   ├── apiClient.js     # HTTP client wrapper
│   │   │   └── healthService.js # Health check API calls
│   │   └── constants/
│   │       └── apiEndpoints.js  # API endpoint definitions
│   ├── Dockerfile.dev           # Frontend container definition
│   └── package.json             # Node.js dependencies
├── docker-compose-override.yml  # Docker Compose configuration
└── .env.example                 # Environment variables template
```

### 🔄 Development Workflow

Both frontend and backend support **hot reloading** during development:

- **Frontend**: Vite detects file changes in `./frontend` and automatically reloads the browser
- **Backend**: Uvicorn's `--reload` flag watches `./backend/app` and restarts the server on changes

### 📝 Environment Variables

| Variable            | Default                 | Description                       |
| ------------------- | ----------------------- | --------------------------------- |
| `FRONTEND_URL`      | `localhost:5173`        | Frontend development server URL   |
| `VITE_APP_API_URL`  | `http://localhost:8000` | Backend API base URL for frontend |
| `POSTGRES_USER`     | `postgres`              | Database username                 |
| `POSTGRES_PASSWORD` | `password`              | Database password                 |
| `POSTGRES_DB`       | `medicconnect`          | Database name                     |

### 🔗 API Documentation

When the backend is running, interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 📦 Technology Stack

**Frontend:**

- React 19.1.1
- React Router 7.9.4
- Vite 7.1.7
- React Toastify 11.0.5

**Backend:**

- FastAPI 0.118.3
- Uvicorn 0.37.0
- SQLAlchemy 2.0.44
- asyncpg 0.30.0
- Python 3.12.11

**Database:**

- PostgreSQL (latest)

**DevOps:**

- Docker & Docker Compose
- Poetry (Python dependency management)
- npm (Node.js package management)

---

## 📄 License

MIT License - See LICENSE file for details
