# backend/seed_data.py
import pandas as pd
from sqlalchemy import text

from app.core.database import SessionLocal, engine
from app.models import Base, Hospital

# Enable pgvector extension before creating tables
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()

# Ensure all tables are created
Base.metadata.create_all(bind=engine)

def seed_hospitals_from_excel(file_path: str):
    db = SessionLocal()
    try:
        # Read the Excel file
        print(f"Reading data from {file_path}...")
        df = pd.read_excel(file_path)

        # Loop through each row in the Excel sheet
        for index, row in df.iterrows():
            # Convert comma-separated string to a Python list for the JSON column
            raw_specialties = row['Specialties']
            specialties_list = (
                []
                if pd.isna(raw_specialties)
                else [s.strip() for s in str(raw_specialties).split(',') if s.strip()]
            )
            new_hospital = Hospital(
                name=row['Name'],
                latitude=row['Latitude'],
                longitude=row['Longitude'],
                budget_tier=row['BudgetTier'],
                specialties=specialties_list,
                total_beds=row['TotalBeds'],
                available_beds=row['AvailableBeds']
            )
            db.add(new_hospital)

        # Save everything to Neon DB
        db.commit()
        print("Successfully seeded all hospitals into Neon DB!")
        
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()
if __name__ == "__main__":
    # Point this to where your Excel file is saved
    seed_hospitals_from_excel("../dataset/synthetic_hospitals.xlsx")