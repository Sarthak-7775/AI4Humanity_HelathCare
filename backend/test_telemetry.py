import asyncio
import json

import websockets


async def listen_to_ambulance():
    # Connect to the WebSocket endpoint you built in Phase 6
    ambulance_id = "DL-14-AMB-9999"
    uri = f"ws://127.0.0.1:8000/ws/ambulance-tracker/{ambulance_id}"
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"✅ Successfully connected to {uri}")
            print("📡 Listening for live telemetry... (Press Ctrl+C to stop)\n")
            
            while True:
                # Receive the JSON string from the server
                message = await websocket.recv()
                data = json.loads(message)
                
                # Format and print the live data
                print(f"🚑 Ambulance: {data['ambulance_id']} | "
                      f"Status: {data['status'].upper()} | "
                      f"Lat: {data['latitude']:.5f}, Lon: {data['longitude']:.5f}")
                
    except websockets.exceptions.ConnectionClosed:
        print("❌ Connection to the server was closed.")
    except Exception as e:
        print(f"⚠️ Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(listen_to_ambulance())
    except KeyboardInterrupt:
        print("\n🛑 Telemetry test stopped.")