# Prescripto - Smart Healthcare Platform

## Project Overview
**Prescripto** is a comprehensive smart healthcare platform designed to streamline medical processes and provide intelligent insights. The system includes:
- **Real-time Bed Occupancy System** and optimum hospital prediction.
- **Ambulance Placement Logic** for faster emergency responses.
- **Medical Test Recommendation Engine** driven by AI.
- **AI Chatbot** for triage and initial medical assistance.

## Directory Structure & File Purposes

Here is a breakdown of the main directories and their roles in the project:

### 1. `frontend/`
This is the main user-facing application where patients or general users interact with Prescripto.
- **Technology Stack**: React, Vite, Tailwind CSS.
- **Key Files**:
  - `package.json`: Manages dependencies (React, React Router, Axios, etc.) and scripts (`npm run dev`).
  - `tailwind.config.js` & `postcss.config.js`: Configuration for styling the application.
  - `vite.config.js`: Configuration for the Vite bundler.

### 2. `backend/`
This is the server-side logic that powers the frontend, handling API requests, database operations, and business logic.
- **Technology Stack**: Node.js, Express, MongoDB (Mongoose).
- **Key Files & Folders**:
  - `server.js`: The main entry point that starts the Node.js server.
  - `package.json`: Lists dependencies such as `express`, `mongoose`, `jsonwebtoken` for auth, `bcrypt` for password hashing, and `cloudinary`/`multer` for file uploads.
  - `controllers/`: Contains the functions handling business logic for different API routes.
  - `models/`: Defines the database schemas (e.g., Users, Hospitals, Appointments) using Mongoose.
  - `routes/`: Defines the API endpoints.
  - `middleware/`: Contains custom functions that run before the controllers (e.g., authentication checks).
  - `.env`: (Hidden file) Stores environment variables like database credentials and API keys.

### 3. `ML_Model/`
This directory integrates the Machine Learning components of the platform.
- **Key Files**:
  - `all_models.html`: A dashboard page that provides links to the hosted machine learning models (often hosted on platforms like Gradio or Google Colab).
  - Included Models:
    - Test Recommendation System
    - Hospital Bed Occupancy Prediction
    - Priority Scheduling
    - AI Chatbot

### Root Level Files
- `README.md`: A brief description of the project and the live deployment link.
- `SECURITY.md`: Contains security policies or instructions for reporting vulnerabilities.
- `LICENSE`: The open-source license governing the project's code.

## How to Run the Project Locally
To run the various parts of this project, you will typically need to open separate terminal windows:

1. **Backend**: Navigate to `backend/`, install `requirements.txt` in a Python virtual environment, and run `uvicorn app.main:app --reload`.
2. **Frontend**: Navigate to `prescripto-frontend/`, run `npm install`, and run `npm run dev`.
