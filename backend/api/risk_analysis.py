from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Case
from ai.llm_service import analyze_risks
from auth.dependencies import (
    require_lawyer,
    get_current_user
)
import json

router = APIRouter(prefix="/analysis", tags=["risk-analysis"])


# ==================================================
# LAWYER → GENERATE / RE-GENERATE AI RISK ANALYSIS
# ==================================================
@router.post("/risk/{case_id}", dependencies=[Depends(require_lawyer)])
def generate_risk_analysis(
    case_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Only assigned lawyer can generate risk
    if str(case.lawyer_id) != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔐 Required data check
    if not case.facts or not case.claims:
        raise HTTPException(
            status_code=400,
            detail="Facts and claims must exist before risk analysis"
        )

    # ============================
    # SAFE JSON PARSING
    # ============================
    try:
        facts = json.loads(case.facts) if case.facts else {}
    except Exception:
        facts = case.facts

    try:
        claims = json.loads(case.claims) if case.claims else []
    except Exception:
        claims = []

    try:
        evidence = case.evidence if case.evidence else {}
    except Exception:
        evidence = {}

    try:
        answers = json.loads(case.mock_answers) if case.mock_answers else []
    except Exception:
        answers = []

    # ============================
    # SAFE AI EXECUTION
    # ============================
    try:
        risk_report = analyze_risks(
            facts=facts,
            claims=claims,
            evidence=evidence,
            answers=answers
        )

        # If AI returned string instead of dict → try parsing
        if isinstance(risk_report, str):
            try:
                risk_report = json.loads(risk_report)
            except Exception:
                print("⚠️ Invalid JSON from AI. Using empty risk structure.")
                risk_report = {}

    except Exception as e:
        print("🔥 Error in analyze_risks:", str(e))

        # Safe fallback structure
        risk_report = {
            "weak_claims": [],
            "loopholes": [],
            "contradictions": [],
            "possible_opponent_challenges": [],
            "jurisdiction_or_limitation_risks": []
        }

    # ============================
    # ENSURE VALID STRUCTURE
    # ============================
    if not isinstance(risk_report, dict):
        risk_report = {}

    # Always ensure required keys exist
    risk_report.setdefault("weak_claims", [])
    risk_report.setdefault("loopholes", [])
    risk_report.setdefault("contradictions", [])
    risk_report.setdefault("possible_opponent_challenges", [])
    risk_report.setdefault("jurisdiction_or_limitation_risks", [])

    # Save safely
    case.risk_report = json.dumps(risk_report, indent=2)
    case.stage = "RISK_ANALYSIS"

    db.commit()

    return {
        "message": "Risk analysis generated successfully",
        "case_id": case_id,
        "stage": case.stage
    }


# ==================================================
# CLIENT / LAWYER → VIEW RISK ANALYSIS
# ==================================================
@router.get("/risk/{case_id}")
def get_risk_analysis(
    case_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Only client or assigned lawyer can view
    if user["user_id"] not in [
        str(case.client_id),
        str(case.lawyer_id)
    ]:
        raise HTTPException(status_code=403, detail="Access denied")

    if not case.risk_report:
        raise HTTPException(
            status_code=404,
            detail="Risk analysis not generated yet"
        )

    try:
        risk_data = json.loads(case.risk_report)
    except Exception:
        risk_data = {}

    return {
        "case_id": case_id,
        "risk_report": risk_data,
        "stage": case.stage
    }