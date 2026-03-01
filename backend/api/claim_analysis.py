from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from ai.llm_service import extract_claims_with_evidence
from auth.dependencies import require_lawyer, get_current_user
import json

router = APIRouter(prefix="/analysis", tags=["claim-analysis"])


# ==================================================
# LAWYER → RUN CLAIM EXTRACTION (AFTER INTAKE)
# ==================================================
@router.post("/claims/{case_id}", dependencies=[Depends(require_lawyer)])
def analyze_claims(
    case_id: str,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Only assigned lawyer can run analysis
    if str(case.lawyer_id) != user["user_id"]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    if case.status != "ACTIVE":
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Claim analysis allowed only for active cases"
        )

    if not case.facts:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Case intake not completed yet"
        )

    # 🔹 Parse intake facts
    try:
        intake_data = json.loads(case.facts)
    except Exception:
        intake_data = case.facts  # fallback if stored as plain text

    # 🔹 AI extracts claims + required evidence
    claims_data = extract_claims_with_evidence(intake_data)

    case.claims = json.dumps(claims_data, indent=2)
    
    case.claims = claims_data
    case.stage = "EVIDENCE"

    db.commit()
    db.close()

    return {
        "message": "Claims extracted successfully",
        "case_id": case_id,
        "claims": claims_data
    }
