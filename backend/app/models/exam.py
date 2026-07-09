from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import enum

class ExamStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"
    SUBMITTED = "submitted"

class ExamSession(Base):
    __tablename__ = "exam_sessions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    subject = Column(String, nullable=False)  # e.g., "Data Structures", "Algorithms"
    job_role = Column(String, nullable=False)
    status = Column(Enum(ExamStatus), default=ExamStatus.NOT_STARTED)
    
    # Exam content
    questions = Column(JSON, nullable=True)  # Serialized questions
    answers = Column(JSON, nullable=True)  # User's answers
    
    # Scoring
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    score = Column(Float, nullable=True)
    
    # Difficulty tracking
    current_difficulty = Column(String, default="Intermediate")  # Easy, Intermediate, Hard
    
    # Timestamps
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Proctoring
    proctoring_enabled = Column(Boolean, default=True)
    proctoring_violations = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="exam_sessions")
    proctoring_records = relationship("ProctoringRecord", back_populates="exam_session")
    
    def __repr__(self):
        return f"<ExamSession {self.id} - {self.subject}>"

class ProctoringRecord(Base):
    __tablename__ = "proctoring_records"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    exam_session_id = Column(String, ForeignKey("exam_sessions.id"), nullable=False, index=True)
    
    # Violation tracking
    violation_type = Column(String)  # e.g., "phone_detected", "face_not_visible", "multiple_faces"
    severity = Column(String)  # low, medium, high
    description = Column(String)
    
    # Frame/timestamp info
    frame_number = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Media
    evidence_image_path = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="proctoring_records")
    exam_session = relationship("ExamSession", back_populates="proctoring_records")
    
    def __repr__(self):
        return f"<ProctoringRecord {self.violation_type}>"
