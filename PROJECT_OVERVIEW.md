# Prescripto - Smart Healthcare Platform

## Project Overview
**Prescripto** is a comprehensive smart healthcare platform designed to streamline medical processes and provide intelligent insights. The system includes:
- **Real-time Bed Occupancy System** and optimum hospital prediction.
- **Ambulance Placement Logic** for faster emergency responses.
- **Medical Test Recommendation Engine** driven by AI.
- **AI Chatbot** for triage and initial medical assistance.

## Directory Structure & File Purposes

Here is a breakdown of the main directories and their roles in the project:

### 1. `prescripto-frontend/`
This is the main user-facing application where patients or general users interact with Prescripto.
- **Technology Stack**: Next.js, React, TypeScript, and Tailwind CSS.
- **Key Files**:
  - `package.json`: Manages dependencies and development/build scripts.
  - `next.config.ts`: Next.js configuration.

### 2. `backend/`
This is the server-side logic that powers the frontend, handling API requests, database operations, ML/RAG, and business logic.
- **Technology Stack**: FastAPI, Python, SQLAlchemy, Neon PostgreSQL, and pgvector.
- **Key Files & Folders**:
  - `app/main.py`: The FastAPI application entry point.
  - `requirements.txt`: Python runtime dependencies.
  - `app/api/`: API route modules.
  - `app/services/`: Business logic, routing, telemetry, and RAG/ML services.
  - `.env`: (Hidden file) Stores environment variables like database credentials and API keys.

### Root Level Files
- `README.md`: A brief description of the project and the live deployment link.
- `SECURITY.md`: Contains security policies or instructions for reporting vulnerabilities.
- `LICENSE`: The open-source license governing the project's code.

## How to Run the Project Locally
To run the various parts of this project, you will typically need to open separate terminal windows:

1. **Backend**: Navigate to `backend/`, install `requirements.txt` in a Python virtual environment, and run `uvicorn app.main:app --reload`.
2. **Frontend**: Navigate to `prescripto-frontend/`, run `npm install`, and run `npm run dev`.
