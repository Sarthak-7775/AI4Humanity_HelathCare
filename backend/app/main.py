# backend/app/main.py (Update)
import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    routes_appointment,
    routes_triage,
    routes_reports,
    routes_routing,
    routes_telemetry,
    routes_users,
)
from app.core.database import Base, ensure_schema_compatibility, engine
from app.services.bed_simulation import simulate_bed_fluctuations

# Automatically create database tables in Neon DB, while preserving
# compatibility with existing databases that are missing newer columns.
Base.metadata.create_all(bind=engine)
ensure_schema_compatibility()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the simulation task
    task = asyncio.create_task(simulate_bed_fluctuations())
    yield
    # Clean up on shutdown
    task.cancel()


app = FastAPI(title="Prescripto API", lifespan=lifespan)
cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000",
    ).split(",")
    if origin.strip()
]
cors_origin_regex = os.getenv("CORS_ORIGIN_REGEX")
if not cors_origin_regex:
    cors_origin_regex = r"https://ai-4-humanity-helath-care-[a-z0-9-]+\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_users.router)
app.include_router(routes_reports.router)
app.include_router(routes_routing.router)
app.include_router(routes_triage.router)
app.include_router(routes_appointment.router)

@app.get("/")
def health_check():
    return {"status": "Prescripto Backend is running flawlessly!"}

    