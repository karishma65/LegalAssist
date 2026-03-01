from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_lawyer, get_current_user
from ai.llm_service import (
    extract_claims_with_evidence,
    analyze_risks
)
import json

router = APIRouter(prefix="/analysis", tags=["full-analysis"])


@router.post("/full/{case_id}", dependencies=[Depends(require_lawyer)])
def run_full_analysis(
    case_id: str,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    if str(case.lawyer_id) != user["user_id"]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    if not case.facts:
        db.close()
        raise HTTPException(status_code=400, detail="Intake not completed")

    try:
        # =========================
        # 1️⃣ CLAIM EXTRACTION
        # =========================
        intake_data = json.loads(case.facts)
        claims_data = extract_claims_with_evidence(intake_data)
        case.claims = claims_data

        # =========================
        # 2️⃣ RISK ANALYSIS
        # =========================
        risk_report = analyze_risks(
            facts=case.facts,
            claims=claims_data,
            evidence=case.evidence or {},
            answers=json.loads(case.mock_answers)
            if case.mock_answers else []
        )

        case.risk_report = json.dumps(risk_report, indent=2)
        case.stage = "RISK_ANALYSIS"

        db.commit()

    except Exception as e:
        db.rollback()
        db.close()
        raise HTTPException(status_code=500, detail=str(e))

    db.close()

    return {
        "message": "Full analysis completed successfully",
        "case_id": case_id
    }