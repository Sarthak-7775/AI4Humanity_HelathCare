import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file
load_dotenv()

# Neon DB Connection string (PostgreSQL)
SQLALCHEMY_DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("No NEON_DATABASE_URL found in environment variables")

# Initialize the SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True,  # Pings the DB before using a connection to ensure it's alive
    pool_recycle=300     # Recycles connections every 5 mins to prevent Neon from dropping them
)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for the SQLAlchemy models
Base = declarative_base()


def ensure_schema_compatibility() -> None:
    """Add columns expected by newer code when the database already exists."""
    with engine.begin() as conn:
        inspector = inspect(conn)
        table_names = set(inspector.get_table_names())

        if "users" not in table_names:
            Base.metadata.create_all(bind=conn)
            return

        user_columns = {col["name"] for col in inspector.get_columns("users")}
        if "avatar_url" not in user_columns:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR"))


# Dependency to get the DB session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()