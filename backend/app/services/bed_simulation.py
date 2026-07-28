import asyncio
import random

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Hospital


async def simulate_bed_fluctuations():
    """
    A scheduled Python background script that dynamically alters 
    hospital bed counts to mimic real-world fluctuations.
    """
def update_beds_sync():
    db: Session = SessionLocal()
    try:
        # Fetch all hospitals
        hospitals = db.query(Hospital).all()
        
        for hospital in hospitals:
            # Randomly fluctuate available beds by -2 to +2
            change = random.randint(-2, 2)
            new_bed_count = hospital.available_beds + change
            
            # Ensure beds don't drop below 0 or exceed total capacity
            if 0 <= new_bed_count <= hospital.total_beds:
                hospital.available_beds = new_bed_count
        
        db.commit()
        print("Bed occupancy updated for all hospitals.")
    except Exception as e:
        print(f"Error updating beds: {e}")
        db.rollback()
    finally:
        db.close()

async def simulate_bed_fluctuations():
    """
    A scheduled Python background script that dynamically alters 
    hospital bed counts to mimic real-world fluctuations.
    """
    while True:
        # Run the synchronous database blocking code in a separate thread
        await asyncio.to_thread(update_beds_sync)
        # Wait for 5 minutes before updating again
        await asyncio.sleep(300)