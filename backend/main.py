from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.intake import router as intake_router
from api.claim_analysis import router as claim_router
from api.mock_followup import router as mock_router
from api.mock_answers import router as answers_router
from api.gap_analysis import router as gap_router
from api.evidence_upload import router as evidence_upload_router
from api.risk_analysis import router as risk_router
from api.auth import router as auth_router
from api.pdf import router as pdf_router
from api.case_request import router as case_request_router
from api.users import router as users_router
from api.full_analysis import router as full_analysis_router
from api import cases

from database.db import engine
from database.models import Base

app = FastAPI(
    title="AI-Based Interactive Legal Assistance System",
    description="Automated Case Intake, Claim–Evidence Analysis, and Mock Questioning",
    version="1.0"
)

# =========================
# ✅ CORS CONFIGURATION
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Create database tables
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# Register API routers
# =========================
app.include_router(auth_router)
app.include_router(intake_router)
app.include_router(claim_router)
app.include_router(mock_router)
app.include_router(answers_router)
app.include_router(gap_router)
app.include_router(evidence_upload_router)
app.include_router(risk_router)
app.include_router(pdf_router)
app.include_router(case_request_router)
app.include_router(users_router)
app.include_router(cases.router)
app.include_router(full_analysis_router)
# =========================
# Health check
# =========================
@app.get("/")
def home():
    return {
        "message": "Legal Assistance System Running (Modules 1–4)"
    }







