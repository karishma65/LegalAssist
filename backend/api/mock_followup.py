from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from ai.llm_service import generate_mock_questions
from auth.dependencies import require_client, get_current_user
import json

router = APIRouter(prefix="/followup", tags=["follow-up"])


@router.get("/questions/{case_id}", dependencies=[Depends(require_client)])
def get_followup_questions(
    case_id: str,
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
        raise HTTPException(status_code=400, detail="Case not active")

    if not case.claims:
        db.close()
        raise HTTPException(status_code=400, detail="Claims not generated yet")

    # ✅ If already generated, return saved version
    if case.followup_questions:
        db.close()
        return {
            "case_id": case_id,
            "followup_questions": case.followup_questions
        }

    # =========================
    # Generate fresh questions
    # =========================
    claims = case.claims
    evidence_data = case.evidence or {}
    followup_questions = []

    for claim_item in claims:
        claim_name = claim_item.get("claim")
        required_evidence = claim_item.get("required_evidence", [])

        uploaded_files = evidence_data.get(claim_name, [])
        uploaded_filenames = [
            item.get("filename", "").lower()
            for item in uploaded_files
        ]

        missing_evidence = []

        for ev in required_evidence:
            ev_key = ev.lower()
            if not any(ev_key in fname for fname in uploaded_filenames):
                missing_evidence.append(ev)

        if missing_evidence:
            questions = generate_mock_questions(
                claim=claim_name,
                missing_evidence=missing_evidence
            )

            for q in questions:
                followup_questions.append({
                    "claim": claim_name,
                    "question": q,
                    "reason": "Missing or insufficient evidence"
                })

    # ✅ Save to DB (CRITICAL FIX)
    case.followup_questions = followup_questions
    db.commit()

    db.close()

    return {
        "case_id": case_id,
        "followup_questions": followup_questions
    }