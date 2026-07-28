# backend/app/services/routing_engine.py
import math


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the straight-line distance between two GPS coordinates in kilometers.
    """
    R = 6371.0 # Earth radius in kilometers

    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Differences
    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

def calculate_eta(distance_km: float, average_speed_kmh: float = 25.0) -> int:
    """
    Estimates travel time based on distance and average city traffic speed.
    Returns ETA in minutes.
    """
    time_hours = distance_km / average_speed_kmh
    time_minutes = int(time_hours * 60)
    # Add a 5-minute buffer for traffic/boarding
    return time_minutes + 5