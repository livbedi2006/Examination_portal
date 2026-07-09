from fastapi import APIRouter, Depends, HTTPException, WebSocket, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas import ProctoringStatusResponse, ProctoringViolation
from app.models.exam import ProctoringRecord
import uuid
import asyncio

router = APIRouter(prefix="/proctoring", tags=["Proctoring"])

# Store active proctoring sessions
active_sessions = {}

@router.post("/start/{exam_id}")
async def start_proctoring(exam_id: str, user_id: str):
    """
    Start proctoring for an exam
    """
    session_id = f"{user_id}_{exam_id}"
    active_sessions[session_id] = {
        "exam_id": exam_id,
        "user_id": user_id,
        "started_at": datetime.utcnow(),
        "violations": [],
        "monitoring": True
    }
    return {"status": "started", "session_id": session_id}

@router.get("/status/{exam_id}", response_model=ProctoringStatusResponse)
async def get_proctoring_status(
    exam_id: str, 
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get current proctoring status for an exam
    """
    violations = db.query(ProctoringRecord).filter(
        ProctoringRecord.exam_session_id == exam_id,
        ProctoringRecord.user_id == user_id
    ).all()
    
    return ProctoringStatusResponse(
        is_monitoring=True,
        violations=[
            ProctoringViolation(
                violation_type=v.violation_type,
                severity=v.severity,
                description=v.description,
                timestamp=v.timestamp
            )
            for v in violations
        ],
        last_frame_timestamp=datetime.utcnow(),
        face_detected=True,
        attention_level=0.95
    )

@router.post("/log-violation/{exam_id}")
async def log_violation(
    exam_id: str,
    user_id: str,
    violation_type: str,
    severity: str,
    description: str,
    db: Session = Depends(get_db)
):
    """
    Log a proctoring violation
    """
    record = ProctoringRecord(
        id=str(uuid.uuid4()),
        user_id=user_id,
        exam_session_id=exam_id,
        violation_type=violation_type,
        severity=severity,
        description=description,
        timestamp=datetime.utcnow()
    )
    
    db.add(record)
    db.commit()
    
    return {"status": "logged", "record_id": record.id}

@router.websocket("/ws/{exam_id}/{user_id}")
async def websocket_proctoring(
    websocket: WebSocket,
    exam_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time proctoring monitoring
    """
    await websocket.accept()
    session_id = f"{user_id}_{exam_id}"
    
    try:
        while True:
            # Receive proctoring frame data from client
            data = await websocket.receive_json()
            
            # Process frame and check for violations
            if data.get("violation_detected"):
                violation = ProctoringRecord(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    exam_session_id=exam_id,
                    violation_type=data.get("violation_type"),
                    severity=data.get("severity", "low"),
                    description=data.get("description", ""),
                    timestamp=datetime.utcnow()
                )
                db.add(violation)
                db.commit()
            
            # Send back status
            await websocket.send_json({
                "status": "received",
                "violations_count": len(db.query(ProctoringRecord).filter(
                    ProctoringRecord.exam_session_id == exam_id
                ).all())
            })
    
    except Exception as e:
        print(f"WebSocket error: {e}")
    
    finally:
        if session_id in active_sessions:
            del active_sessions[session_id]
