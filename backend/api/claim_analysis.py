from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from ai.llm_service import extract_claims_with_evidence
from auth.dependencies import require_lawyer, get_current_user
import json

router = APIRouter(prefix="/analysis", tags=["claim-analysis"])


@router.post("/claims/{case_id}", dependencies=[Depends(require_lawyer)])
def analyze_claims(
    case_id: str,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()

        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        # 🔐 Only assigned lawyer
        if str(case.lawyer_id) != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        if not case.facts:
            raise HTTPException(
                status_code=400,
                detail="Case intake not completed yet"
            )

        # Safe JSON loading
        try:
            intake_data = json.loads(case.facts)
        except Exception:
            intake_data = case.facts

        # 🔹 AI extraction (ALLOW RE-RUN)
        claims_data = extract_claims_with_evidence(intake_data)

        # Save properly as JSON string
        case.claims = json.dumps(claims_data, indent=2)

        case.stage = "EVIDENCE"

        db.commit()

        return {
            "message": "Claims extracted successfully",
            "case_id": case_id,
            "claims": claims_data
        }

    finally:
        db.close()