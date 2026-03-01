from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_lawyer, get_current_user
from ai.llm_service import analyze_risks
import json

router = APIRouter(prefix="/analysis", tags=["gap-analysis"])


# ==================================================
# LAWYER → RUN AI GAP & RISK ANALYSIS
# ==================================================
@router.post("/gaps/{case_id}", dependencies=[Depends(require_lawyer)])
def gap_analysis(
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

    if case.status != "ACTIVE":
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Gap & risk analysis allowed only for active cases"
        )

    if not case.facts or not case.claims:
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Facts and claims must exist before gap analysis"
        )

    # 🔹 Prepare inputs for AI
    facts = case.facts
    claims = json.loads(case.claims) if case.claims else []
    evidence = json.loads(case.evidence) if case.evidence else {}
    answers = json.loads(case.mock_answers) if case.mock_answers else []

    # 🔹 AI performs gap & risk analysis
    ai_report = analyze_risks(
        facts=facts,
        claims=claims,
        evidence=evidence,
        answers=answers
    )

    # 🔹 Store AI output
    case.risk_report = json.dumps(ai_report, indent=2)

    db.commit()
    db.close()

    return {
        "message": "AI gap and risk analysis completed",
        "case_id": case_id,
        "risk_report": ai_report
    }
