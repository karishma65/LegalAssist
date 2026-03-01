from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_lawyer, require_client, get_current_user

router = APIRouter(prefix="/cases", tags=["cases"])


# ==================================================
# LAWYER → MY CASES
# ==================================================
@router.get("/my", dependencies=[Depends(require_lawyer)])
def get_lawyer_cases(user=Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        cases = (
            db.query(Case)
            .filter(Case.lawyer_id == user["user_id"])
            .order_by(Case.created_at.desc())
            .all()
        )

        return [
            {
                "case_id": str(c.case_id),
                "client_id": str(c.client_id),
                "status": c.status,
                "stage": c.stage,
                "created_at": c.created_at,
            }
            for c in cases
        ]
    finally:
        db.close()


# ==================================================
# CLIENT → MY CASES
# ==================================================
@router.get("/client/my", dependencies=[Depends(require_client)])
def get_client_cases(user=Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        cases = (
            db.query(Case)
            .filter(Case.client_id == user["user_id"])
            .order_by(Case.created_at.desc())
            .all()
        )

        return [
            {
                "case_id": str(c.case_id),
                "status": c.status,
                "stage": c.stage,
                "lawyer_name": c.lawyer.username if c.lawyer else "Assigned",
                "created_at": c.created_at,
            }
            for c in cases
        ]
    finally:
        db.close()

# ==================================================
# CLIENT / LAWYER → CONTINUE CASE (FULL DETAILS)
# ==================================================
@router.get("/{case_id}")
def get_case(case_id: str, user=Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        case = db.query(Case).filter(Case.case_id == case_id).first()

        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        if user["user_id"] not in [str(case.client_id), str(case.lawyer_id)]:
            raise HTTPException(status_code=403, detail="Access denied")

        return {
            "case_id": str(case.case_id),
            "client_id": str(case.client_id),
            "client_name": case.client.username if case.client else None,
            "lawyer_id": str(case.lawyer_id) if case.lawyer_id else None,
            "status": case.status,
            "stage": case.stage,
            "facts": case.facts,
            "claims": case.claims if case.claims else [],
            "evidence": case.evidence if case.evidence else {},
            "mock_answers": case.mock_answers,
            "created_at": case.created_at,
        }

    finally:
        db.close()

# ==================================================
# CLIENT → VIEW CLAIMS
# ==================================================
@router.get("/{case_id}/claims", dependencies=[Depends(require_client)])
def get_case_claims(case_id: str, user=Depends(get_current_user)):
    db: Session = SessionLocal()
    try:
        case = db.query(Case).filter(
            Case.case_id == case_id,
            Case.client_id == user["user_id"]
        ).first()

        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        return {
            "claims": case.claims if case.claims else []
        }
    finally:
        db.close()
