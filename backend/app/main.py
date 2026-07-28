# backend/app/main.py (Update)
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    routes_appointment,
    routes_chatbot,
    routes_reports,
    routes_routing,
    routes_telemetry,
    routes_users,
)
from app.core.database import Base, engine
from app.services.bed_simulation import simulate_bed_fluctuations

# Automatically create database tables in Neon DB
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the simulation task
    task = asyncio.create_task(simulate_bed_fluctuations())
    yield
    # Clean up on shutdown
    task.cancel()


app = FastAPI(title="Prescripto API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_users.router, prefix="/auth", tags=["Authentication"])
app.include_router(routes_users.router, tags=["Authentication"])
app.include_router(routes_reports.router, prefix="/reports", tags=["Medical Reports"])
app.include_router(routes_routing.router, prefix="/emergency", tags=["Emergency Routing"])
app.include_router(routes_chatbot.router, prefix="/chatbot", tags=["AI Triage"])
app.include_router(routes_appointment.router, tags=["Appointments"])

@app.get("/")
def health_check():
    return {"status": "Prescripto Backend is running flawlessly!"}