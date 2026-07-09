from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ============ AUTH SCHEMAS ============

class GoogleAuthRequest(BaseModel):
    token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int
    user_id: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    job_role: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    job_role: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    job_role: Optional[str]
    profile_picture: Optional[str]
    created_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

# ============ EXAM SCHEMAS ============

class QuestionData(BaseModel):
    question_id: str
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    band: str
    correct_answer: Optional[str] = None

class StartExamRequest(BaseModel):
    subject: str
    job_role: str

class ExamSessionResponse(BaseModel):
    id: str
    user_id: str
    subject: str
    job_role: str
    status: str
    current_difficulty: str
    total_questions: int
    correct_answers: int
    started_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer: str  # a, b, c, d
    time_spent: int  # seconds

class SubmitAnswerResponse(BaseModel):
    was_correct: bool
    correct_answer: str
    new_difficulty: str
    next_question: Optional[QuestionData]
    score_update: Dict[str, Any]

class ExamResultResponse(BaseModel):
    exam_id: str
    subject: str
    total_questions: int
    correct_answers: int
    score: float
    difficulty_progression: List[str]
    completed_at: datetime
    
    class Config:
        from_attributes = True

# ============ PROCTORING SCHEMAS ============

class ProctoringViolation(BaseModel):
    violation_type: str
    severity: str  # low, medium, high
    description: str
    timestamp: datetime
    evidence_image_url: Optional[str] = None

class ProctoringStatusResponse(BaseModel):
    is_monitoring: bool
    violations: List[ProctoringViolation]
    last_frame_timestamp: Optional[datetime]
    face_detected: bool
    attention_level: float  # 0-1

# ============ SUBJECT/JOB SCHEMAS ============

class SubjectOption(BaseModel):
    subject_id: str
    name: str
    description: str
    estimated_duration: int  # minutes
    questions_count: int

class JobRoleSubjects(BaseModel):
    job_role: str
    subjects: List[SubjectOption]
