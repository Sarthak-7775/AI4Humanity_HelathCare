import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

@router.websocket("/ws/ambulance-tracker/{ambulance_id}")
async def ambulance_tracker(websocket: WebSocket, ambulance_id: str):
    """
    Implements WebSockets in FastAPI to push simulated, continuous 
    GPS coordinate updates to the Next.js frontend.
    """
    await websocket.accept()
    
    # Starting coordinates (e.g., center of Delhi)
    current_lat = 28.6139
    current_lon = 77.2090
    
    try:
        while True:
            # Simulate movement by slightly adjusting coordinates
            current_lat += 0.0001
            current_lon += 0.0001
            
            payload = {
                "ambulance_id": ambulance_id,
                "latitude": current_lat,
                "longitude": current_lon,
                "status": "en_route"
            }
            
            # Send continuous GPS coordinate updates
            await websocket.send_text(json.dumps(payload))
            
            # Push updates every 2 seconds for smooth rendering on Ola Maps
            await asyncio.sleep(2)
            
    except WebSocketDisconnect:
        print(f"Ambulance {ambulance_id} tracker disconnected.")