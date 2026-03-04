from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_client, get_current_user
import os
import json
import uuid
from datetime import datetime

router = APIRouter(prefix="/evidence", tags=["evidence"])

UPLOAD_BASE_DIR = "uploads"


@router.post("/upload/{case_id}", dependencies=[Depends(require_client)])
def upload_evidence(
    case_id: str,
    claim: str = Form(...),
    files: list[UploadFile] = File(...),
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    try:
        # =========================
        # Get Case Safely
        # =========================
        case = db.query(Case).filter(
            Case.case_id == uuid.UUID(case_id)
        ).first()

        if not case:
            raise HTTPException(status_code=404, detail="Case not found")

        # =========================
        # Security Check
        # =========================
        if str(case.client_id) != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")

        if case.status != "ACTIVE":
            raise HTTPException(
                status_code=400,
                detail="Evidence upload allowed only for active cases"
            )

        # =========================
        # Prepare directories
        # =========================
        safe_claim = claim.replace(" ", "_")

        case_dir = os.path.join(UPLOAD_BASE_DIR, case_id)
        claim_dir = os.path.join(case_dir, safe_claim)

        os.makedirs(claim_dir, exist_ok=True)

        # =========================
        # Load existing evidence safely
        # =========================
        if not case.evidence:
            evidence_data = {}
        else:
            if isinstance(case.evidence, str):
                evidence_data = json.loads(case.evidence)
            else:
                evidence_data = case.evidence

        # Ensure claim key exists
        if claim not in evidence_data:
            evidence_data[claim] = []

        uploaded_files = []

        # =========================
        # Save files
        # =========================
        for file in files:

            file_path = os.path.join(claim_dir, file.filename)

            # Save file
            with open(file_path, "wb") as f:
                f.write(file.file.read())

            # Append evidence entry
            evidence_data[claim].append({
                "filename": file.filename,
                "status": "Uploaded",
                "uploaded_at": datetime.utcnow().isoformat()
            })

            uploaded_files.append(file.filename)

        # =========================
        # Save back to database
        # =========================
        case.evidence = evidence_data
        case.stage = "FOLLOWUP"

        db.commit()

        return {
            "message": "Evidence uploaded successfully",
            "case_id": case_id,
            "claim": claim,
            "files_uploaded": uploaded_files
        }

    finally:
        db.close()