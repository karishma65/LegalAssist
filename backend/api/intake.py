from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_client, get_current_user

from ai.llm_service import ai_case_intake, extract_claims_with_evidence
import json

router = APIRouter(prefix="/case", tags=["case-intake"])


# ======================
# REQUEST MODEL
# ======================
class CaseIntake(BaseModel):
    facts: str

    @validator("facts")
    def not_empty(cls, value):
        if not value or value.strip() == "":
            raise ValueError("Case facts are mandatory")
        return value


# ==================================================
# CLIENT → SUBMIT INTAKE
# ==================================================
@router.post("/{case_id}/intake", dependencies=[Depends(require_client)])
def submit_case_intake(
    case_id: str,
    data: CaseIntake,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    if str(case.client_id) != user["user_id"]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    if case.status != "ACTIVE":
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Case intake allowed only after lawyer acceptance"
        )

    # 1️⃣ Save raw facts
    case.facts = data.facts

    # 2️⃣ AI structured intake
    intake_report = ai_case_intake(data.facts)

    if not intake_report:
        db.close()
        raise HTTPException(
            status_code=500,
            detail="AI intake processing failed"
        )

    # Store structured intake safely
    case.description = json.dumps(intake_report)

    # 3️⃣ Extract claims
    claims = extract_claims_with_evidence(intake_report)
    case.claims = claims
    case.stage = "CLAIMS"
    db.commit()
    db.close()

    return {
        "message": "Case intake submitted successfully",
        "case_id": case_id,
        "claims_count": len(claims)
    }


# ==================================================
# CLIENT → VIEW OWN CASES
# ==================================================
@router.get("/my-cases", dependencies=[Depends(require_client)])
def get_my_cases(user=Depends(get_current_user)):
    db: Session = SessionLocal()

    cases = db.query(Case).filter(
        Case.client_id == user["user_id"]
    ).all()

    db.close()

    return [
        {
            "case_id": c.case_id,
            "status": c.status,
            "created_at": c.created_at
        }
        for c in cases
    ]


# ==================================================
# CLIENT / LAWYER → VIEW CASE DETAILS
# ==================================================
@router.get("/{case_id}")
def get_case_details(
    case_id: str,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()
    db.close()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if user["user_id"] not in [str(case.client_id), str(case.lawyer_id)]:
        raise HTTPException(status_code=403, detail="Access denied")

    # ✅ SAFE JSON PARSING
    intake_report = None
    if case.description:
        try:
            intake_report = json.loads(case.description)
        except Exception:
            intake_report = case.description  # fallback for old data

    return {
        "case_id": case.case_id,
        "facts": case.facts,
        "intake_report": intake_report,
        "claims": case.claims,
        "status": case.status,
        "created_at": case.created_at
    }
