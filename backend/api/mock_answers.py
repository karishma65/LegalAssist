from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_client, get_current_user
import json

router = APIRouter(prefix="/followup", tags=["mock-answers"])


class AnswerItem(BaseModel):
    claim: str
    question: str
    answer: str


class AnswerSubmission(BaseModel):
    answers: list[AnswerItem]


# ==================================================
# CLIENT → SUBMIT ANSWERS TO AI FOLLOW-UP QUESTIONS
# ==================================================
@router.post("/answers/{case_id}", dependencies=[Depends(require_client)])
def submit_answers(
    case_id: str,
    data: AnswerSubmission,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Ownership check
    if str(case.client_id) != user["user_id"]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    # 🔐 Flow check
    if case.status != "ACTIVE":
        db.close()
        raise HTTPException(
            status_code=400,
            detail="Follow-up answers allowed only for active cases"
        )

    case.mock_answers = json.dumps(
        [a.dict() for a in data.answers],
        indent=2
    )
    case.stage = "WAITING_LAWYER"

    db.commit()
    db.close()

    return {
        "message": "Follow-up answers stored successfully",
        "case_id": case_id
    }
