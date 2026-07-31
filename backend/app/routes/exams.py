from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas import (
    StartExamRequest, ExamSessionResponse, SubmitAnswerRequest,
    SubmitAnswerResponse, ExamResultResponse, QuestionData
)
from app.models.exam import ExamSession, ExamStatus, ProctoringRecord
from app.exam_engine import ExamEngine
from app.auth import get_current_user_id
import uuid

router = APIRouter(prefix="/exams", tags=["Exams"])

exam_engine = ExamEngine()

@router.post("/start", response_model=ExamSessionResponse)
async def start_exam(
    request: StartExamRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Start a new exam session
    """
    exam_id = str(uuid.uuid4())

    # Get first question
    first_question = exam_engine.get_first_question(request.subject)
    if not first_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No questions available for this subject"
        )

    # Create exam session
    exam_session = ExamSession(
        id=exam_id,
        user_id=user_id,
        subject=request.subject,
        job_role=request.job_role,
        status=ExamStatus.IN_PROGRESS,
        questions=[first_question],
        answers=[],
        total_questions=0,
        correct_answers=0,
        current_difficulty="Intermediate",
        started_at=datetime.utcnow(),
        proctoring_enabled=True
    )

    db.add(exam_session)
    db.commit()
    db.refresh(exam_session)

    return exam_session

@router.post("/submit-answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    request: SubmitAnswerRequest,
    exam_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Submit an answer and get the next question
    """
    exam = db.query(ExamSession).filter(
        ExamSession.id == exam_id,
        ExamSession.user_id == user_id
    ).first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )

    # Check answer
    current_question = exam.questions[-1] if exam.questions else None
    if not current_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No current question"
        )

    correct_answer = current_question.get("correct_answer", "a")
    is_correct = request.answer.lower() == correct_answer.lower()

    # Update exam tracking
    exam.total_questions += 1
    if is_correct:
        exam.correct_answers += 1

    # Update difficulty based on answer
    new_difficulty = exam_engine.update_difficulty(
        is_correct,
        exam.current_difficulty
    )
    exam.current_difficulty = new_difficulty

    # Get next question
    next_question = exam_engine.get_next_question(
        exam.subject,
        new_difficulty
    )

    # Record answer
    if not exam.answers:
        exam.answers = []
    exam.answers.append({
        "question_id": request.question_id,
        "answer": request.answer,
        "correct": is_correct,
        "time_spent": request.time_spent
    })

    exam.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(exam)

    return SubmitAnswerResponse(
        was_correct=is_correct,
        correct_answer=correct_answer,
        new_difficulty=new_difficulty,
        next_question=next_question,
        score_update={
            "total": exam.total_questions,
            "correct": exam.correct_answers,
            "percentage": (exam.correct_answers / exam.total_questions * 100) if exam.total_questions > 0 else 0
        }
    )

@router.post("/complete/{exam_id}", response_model=ExamResultResponse)
async def complete_exam(
    exam_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Complete and submit an exam
    """
    exam = db.query(ExamSession).filter(
        ExamSession.id == exam_id,
        ExamSession.user_id == user_id
    ).first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )

    # Calculate final score
    if exam.total_questions > 0:
        exam.score = (exam.correct_answers / exam.total_questions) * 100
    else:
        exam.score = 0

    exam.status = ExamStatus.COMPLETED
    exam.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(exam)

    return ExamResultResponse(
        exam_id=exam.id,
        subject=exam.subject,
        total_questions=exam.total_questions,
        correct_answers=exam.correct_answers,
        score=exam.score,
        difficulty_progression=["Intermediate"],  # Can track progression
        completed_at=exam.completed_at
    )

@router.get("/history", response_model=list[ExamResultResponse])
async def get_exam_history(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get user's exam history
    """
    exams = db.query(ExamSession).filter(
        ExamSession.user_id == user_id,
        ExamSession.status == ExamStatus.COMPLETED
    ).all()

    return [
        ExamResultResponse(
            exam_id=exam.id,
            subject=exam.subject,
            total_questions=exam.total_questions,
            correct_answers=exam.correct_answers,
            score=exam.score,
            difficulty_progression=["Intermediate"],
            completed_at=exam.completed_at
        )
        for exam in exams
    ]

@router.get("/{exam_id}", response_model=ExamSessionResponse)
async def get_exam_status(
    exam_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get current exam status
    """
    exam = db.query(ExamSession).filter(
        ExamSession.id == exam_id,
        ExamSession.user_id == user_id
    ).first()

    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found"
        )

    return exam
