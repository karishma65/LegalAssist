from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Literal
import uuid

from database.db import SessionLocal
from database.models import CaseRequest, Case
from auth.dependencies import require_client, require_lawyer, get_current_user

router = APIRouter(prefix="/case-request", tags=["case-request"])


# =========================
# REQUEST BODY MODEL
# =========================
class CaseRequestInput(BaseModel):
    lawyer_id: str
    short_summary: str = Field(..., min_length=5)
    urgency: Literal["low", "medium", "high"]


# =================================================
# CLIENT → SEND CONSULTATION REQUEST
# =================================================
@router.post("/send", dependencies=[Depends(require_client)])
def send_case_request(
    data: CaseRequestInput,
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        existing = db.query(CaseRequest).filter(
            CaseRequest.client_id == user["user_id"],
            CaseRequest.lawyer_id == data.lawyer_id,
            CaseRequest.status == "PENDING"
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="A consultation request is already pending for this lawyer"
            )

        new_request = CaseRequest(
            request_id=uuid.uuid4(),
            client_id=user["user_id"],
            lawyer_id=data.lawyer_id,
            short_summary=data.short_summary,
            urgency=data.urgency,
            status="PENDING"
        )

        db.add(new_request)
        db.commit()

        return {
            "message": "Consultation request sent to lawyer",
            "request_id": str(new_request.request_id)
        }

    finally:
        db.close()


# ==========================================
# CLIENT → VIEW MY SENT REQUESTS  ✅ REQUIRED
# ==========================================
@router.get("/my", dependencies=[Depends(require_client)])
def get_my_requests(user=Depends(get_current_user)):
    db: Session = SessionLocal()

    try:
        requests = (
            db.query(CaseRequest)
            .filter(CaseRequest.client_id == user["user_id"])
            .order_by(CaseRequest.created_at.desc())
            .all()
        )

        return [
            {
                "request_id": str(req.request_id),
                "lawyer_id": str(req.lawyer_id),
                "lawyer_name": req.lawyer.username if req.lawyer else "Unknown",
                "short_summary": req.short_summary,
                "urgency": req.urgency,
                "status": req.status,
                "created_at": req.created_at
            }
            for req in requests
        ]

    finally:
        db.close()


# ==========================================
# LAWYER → VIEW INCOMING REQUESTS
# ==========================================
@router.get("/incoming", dependencies=[Depends(require_lawyer)])
def get_lawyer_requests(user=Depends(get_current_user)):
    db: Session = SessionLocal()

    try:
        requests = db.query(CaseRequest).filter(
            CaseRequest.lawyer_id == user["user_id"],
            CaseRequest.status == "PENDING"
        ).all()

        return [
            {
                "request_id": str(req.request_id),
                "client_id": str(req.client_id),
                "short_summary": req.short_summary,
                "urgency": req.urgency,
                "status": req.status
            }
            for req in requests
        ]

    finally:
        db.close()


# ==========================================
# LAWYER → ACCEPT REQUEST
# ==========================================
@router.post("/accept/{request_id}", dependencies=[Depends(require_lawyer)])
def accept_request(request_id: str, user=Depends(get_current_user)):
    db: Session = SessionLocal()

    try:
        req = db.query(CaseRequest).filter(
            CaseRequest.request_id == request_id,
            CaseRequest.status == "PENDING"
        ).first()

        if not req:
            raise HTTPException(status_code=404, detail="Request not found")

        if str(req.lawyer_id) != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        req.status = "ACCEPTED"

        new_case = Case(
            client_id=req.client_id,
            lawyer_id=req.lawyer_id,
            status="ACTIVE"
        )

        db.add(new_case)
        db.commit()

        return {
            "message": "Request accepted and case created",
            "case_id": str(new_case.case_id)
        }

    finally:
        db.close()


# ==========================================
# LAWYER → REJECT REQUEST
# ==========================================
@router.post("/reject/{request_id}", dependencies=[Depends(require_lawyer)])
def reject_request(request_id: str, user=Depends(get_current_user)):
    db: Session = SessionLocal()

    try:
        req = db.query(CaseRequest).filter(
            CaseRequest.request_id == request_id,
            CaseRequest.status == "PENDING"
        ).first()

        if not req:
            raise HTTPException(status_code=404, detail="Request not found")

        if str(req.lawyer_id) != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        req.status = "REJECTED"
        db.commit()

        return {"message": "Request rejected"}

    finally:
        db.close()
