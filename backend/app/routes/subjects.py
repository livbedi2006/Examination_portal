from fastapi import APIRouter
from app.schemas import SubjectOption, JobRoleSubjects

router = APIRouter(prefix="/subjects", tags=["Subjects"])

# Available subjects mapped to job roles
JOB_SUBJECTS_MAP = {
    "Software Engineer": [
        SubjectOption(
            subject_id="dsa",
            name="Data Structures & Algorithms",
            description="Master core programming concepts",
            estimated_duration=120,
            questions_count=50
        ),
        SubjectOption(
            subject_id="oop",
            name="Object-Oriented Programming",
            description="OOP principles and design patterns",
            estimated_duration=90,
            questions_count=40
        ),
        SubjectOption(
            subject_id="system_design",
            name="System Design",
            description="Large-scale system architecture",
            estimated_duration=120,
            questions_count=45
        ),
    ],
    "Data Scientist": [
        SubjectOption(
            subject_id="statistics",
            name="Statistics & Probability",
            description="Statistical concepts and methods",
            estimated_duration=100,
            questions_count=40
        ),
        SubjectOption(
            subject_id="machine_learning",
            name="Machine Learning",
            description="ML algorithms and applications",
            estimated_duration=120,
            questions_count=50
        ),
        SubjectOption(
            subject_id="data_analysis",
            name="Data Analysis",
            description="Data manipulation and visualization",
            estimated_duration=90,
            questions_count=35
        ),
    ],
    "Frontend Developer": [
        SubjectOption(
            subject_id="html_css",
            name="HTML & CSS",
            description="Web markup and styling",
            estimated_duration=80,
            questions_count=35
        ),
        SubjectOption(
            subject_id="javascript",
            name="JavaScript",
            description="Core JavaScript programming",
            estimated_duration=120,
            questions_count=50
        ),
        SubjectOption(
            subject_id="react",
            name="React.js",
            description="React framework and concepts",
            estimated_duration=100,
            questions_count=45
        ),
    ],
    "Backend Developer": [
        SubjectOption(
            subject_id="databases",
            name="Databases",
            description="SQL and database design",
            estimated_duration=100,
            questions_count=40
        ),
        SubjectOption(
            subject_id="apis",
            name="API Design",
            description="REST APIs and web services",
            estimated_duration=90,
            questions_count=38
        ),
        SubjectOption(
            subject_id="backend_frameworks",
            name="Backend Frameworks",
            description="Server frameworks and architecture",
            estimated_duration=110,
            questions_count=45
        ),
    ],
}

@router.get("/by-role/{job_role}", response_model=JobRoleSubjects)
async def get_subjects_by_job_role(job_role: str):
    """
    Get available subjects for a specific job role
    """
    subjects = JOB_SUBJECTS_MAP.get(job_role, [])
    
    if not subjects:
        return JobRoleSubjects(
            job_role=job_role,
            subjects=[]
        )
    
    return JobRoleSubjects(
        job_role=job_role,
        subjects=subjects
    )

@router.get("/all")
async def get_all_subjects():
    """
    Get all available job roles and their subjects
    """
    return JOB_SUBJECTS_MAP

@router.get("/job-roles")
async def get_all_job_roles():
    """
    Get list of all available job roles
    """
    return list(JOB_SUBJECTS_MAP.keys())
