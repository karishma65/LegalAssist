from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from ai.llm_service import analyze_risks
from auth.dependencies import (
    require_lawyer,
    require_client,
    get_current_user
)
import json

router = APIRouter(prefix="/analysis", tags=["risk-analysis"])


# ==================================================
# LAWYER → GENERATE AI RISK ANALYSIS (ONCE)
# ==================================================
@router.post("/risk/{case_id}", dependencies=[Depends(require_lawyer)])
def generate_risk_analysis(
    case_id: str,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Only assigned lawyer
    if str(case.lawyer_id) != user["user_id"]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔐 Case must be active
    if case.status != "ACTIVE":
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Risk analysis allowed only for active cases"
        )

    # 🔐 Required data check
    if not case.facts or not case.claims:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Facts and claims must exist before risk analysis"
        )

    facts = case.facts
    claims = case.claims or []
    evidence = case.evidence or {}
    answers = json.loads(case.mock_answers) if case.mock_answers else []

    # 🔹 AI performs risk analysis
    risk_report = analyze_risks(
        facts=facts,
        claims=claims,
        evidence=evidence,
        answers=answers
    )

    case.risk_report = json.dumps(risk_report, indent=2)
    case.stage = "RISK_ANALYSIS"

    db.commit()
    db.close()

    return {
        "message": "Risk analysis generated successfully",
        "case_id": case_id
    }


# ==================================================
# CLIENT / LAWYER → VIEW RISK ANALYSIS
# ==================================================
@router.get("/risk/{case_id}")
def get_risk_analysis(
    case_id: str,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()
    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Client or assigned lawyer only
    if user["user_id"] not in [str(case.client_id), str(case.lawyer_id)]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    if not case.risk_report:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Risk analysis not generated yet"
        )

    risk_data = json.loads(case.risk_report)

    db.close()

    return {
        "case_id": case_id,
        "risk_report": risk_data,
        "stage": case.stage
    }
