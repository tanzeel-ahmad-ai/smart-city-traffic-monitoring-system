from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from enum import Enum

import mysql.connector
import bcrypt
import cv2
from ultralytics import YOLO
from datetime import datetime, timedelta

# =========================
# APP INIT
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# LOAD MODEL
# =========================
model = YOLO("best.pt")

# =========================
# DB CONNECTION
# =========================
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="tanzeel@mysql",
        database="smartcity"
    )

# =========================
# CONSTANTS
# =========================
VEHICLE_TYPES = ["car", "bus", "truck", "motorcycle","rikshaw"]

# =========================
# AUTH MODELS
# =========================
class Role(str, Enum):
    citizen = "citizen"
    admin = "admin"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: Role

# =========================
# LOGIN API
# =========================
@app.post("/login")
def login(data: LoginRequest):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM user WHERE email=%s AND role=%s",
        (data.email, data.role)
    )

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if not user:
        raise HTTPException(404, "User not found")

    if not bcrypt.checkpw(data.password.encode(), user["password"].encode()):
        raise HTTPException(401, "Incorrect password")

    return {
        "message": "Login successful",
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"]
    }

# =========================
# CAMERA MODEL
# =========================
class Camera(BaseModel):
    camera_id: str
    camera_name: str
    latitude: float
    longitude: float

# =========================
# ADD CAMERA
# =========================
@app.post("/cameras")
def add_camera(camera: Camera):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO cameras (camera_id, camera_name, latitude, longitude) VALUES (%s,%s,%s,%s)",
        (camera.camera_id, camera.camera_name, camera.latitude, camera.longitude)
    )

    db.commit()
    cursor.close()
    db.close()

    return {"message": "Camera added successfully"}

# =========================
# GET CAMERAS
# =========================
@app.get("/cameras")
def get_cameras():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM cameras")
    rows = cursor.fetchall()

    cursor.close()
    db.close()

    return {"cameras": rows}

# =========================
# VEHICLE HELPERS
# =========================
def get_vehicle_id(vehicle_type):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT vehicle_id FROM vehicles WHERE type=%s",
            (vehicle_type,)
        )
        row = cursor.fetchone()

        if row:
            return row[0]

        cursor.execute(
            "INSERT INTO vehicles (type) VALUES (%s)",
            (vehicle_type,)
        )
        db.commit()

        return cursor.lastrowid

    finally:
        cursor.close()
        db.close()

# =========================
# SAVE DETECTION (IMPROVED)
# =========================
def save_detection(camera_id, vehicle_id, detection_time):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO detections (camera_id, vehicle_id, detection_time)
            VALUES (%s, %s, %s)
            """,
            (camera_id, vehicle_id, detection_time)
        )
        db.commit()

    finally:
        cursor.close()
        db.close()

# =========================
# VIDEO PROCESSING
# =========================
LINE_Y = 650

@app.post("/upload-video")
async def upload_video(
    camera_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        temp_path = "temp.mp4"

        with open(temp_path, "wb") as f:
            f.write(contents)

        cap = cv2.VideoCapture(temp_path)

        if not cap.isOpened():
            return {"error": "Video not opened"}

        track_history = {}
        counted = set()
        detections_output = []

        base_time = datetime.now()
        frame_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            results = model.track(
                frame,
                persist=True,
                tracker="bytetrack.yaml",
                conf=0.3
            )

            if not results or results[0].boxes is None:
                continue

            boxes = results[0].boxes

            if boxes.id is None:
                continue

            track_ids = boxes.id.int().cpu().tolist()
            class_ids = boxes.cls.int().cpu().tolist()
            xyxy = boxes.xyxy.cpu().tolist()

            for tid, cls, box in zip(track_ids, class_ids, xyxy):

                x1, y1, x2, y2 = box
                cy = int((y1 + y2) / 2)

                vehicle_type = model.names[cls]

                if tid in track_history:
                    prev_cy = track_history[tid]

                    if prev_cy < LINE_Y and cy >= LINE_Y:
                        if tid not in counted:
                            counted.add(tid)

                            vehicle_id = get_vehicle_id(vehicle_type)

                            # ✅ simulate timeline
                            fake_time = base_time + timedelta(seconds=frame_count)

                            save_detection(camera_id, vehicle_id, fake_time)

                            detections_output.append({
                                "track_id": tid,
                                "vehicle_type": vehicle_type
                            })

                track_history[tid] = cy

            frame_count += 1

        cap.release()

        return {
            "message": "Video processed successfully",
            "total_counted": len(detections_output),
            "detections": detections_output
        }

    except Exception as e:
        return {"error": str(e)}

# =========================
# HELPER: FILL MISSING TYPES
# =========================
def fill_missing_types(rows):
    data_map = {r["type"].lower(): r["total"] for r in rows}

    return [
        {"type": t, "total": data_map.get(t, 0)}
        for t in VEHICLE_TYPES
    ]



# =========================
# CONGESTION (LIVE)
# =========================
@app.get("/camera/{camera_id}/congestion")
def get_congestion(camera_id: str):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT COUNT(*) 
        FROM detections
        WHERE camera_id = %s
        AND detection_time >= NOW() - INTERVAL 1 HOUR
    """, (camera_id,))

    total = cursor.fetchone()[0]

    level = "LOW" if total < 100 else "MEDIUM" if total < 150 else "HIGH"

    cursor.close()
    db.close()

    return {
        "vehicles_last_hour": total,
        "congestion": level
    }


# =========================
# GET DETECTIONS (FIX)
# =========================
@app.get("/detections/{camera_id}")
def get_detections(camera_id: str):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("""
        SELECT d.detection_id, d.camera_id, v.type as vehicle_type, d.detection_time
        FROM detections d
        JOIN vehicles v ON d.vehicle_id = v.vehicle_id
        WHERE d.camera_id = %s
        ORDER BY d.detection_time DESC
    """, (camera_id,))

    rows = cursor.fetchall()

    cursor.close()
    db.close()

    return {"detections": rows}


@app.get("/cameras/{camera_id}/detections")
def get_camera_detections(camera_id: str):
    return get_detections(camera_id)
