from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from auth.dependencies import require_client, get_current_user
import os
import json
from datetime import datetime

router = APIRouter(prefix="/evidence", tags=["evidence"])

UPLOAD_BASE_DIR = "uploads"


# ==================================================
# CLIENT → UPLOAD EVIDENCE (REAL FILE UPLOAD)
# ==================================================
@router.post("/upload/{case_id}", dependencies=[Depends(require_client)])
def upload_evidence(
    case_id: str,
    claim: str = Form(...),
    files: list[UploadFile] = File(...),
    user=Depends(get_current_user)
):
    db: Session = SessionLocal()

    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        db.close()
        raise HTTPException(status_code=404, detail="Case not found")

    # 🔐 Security check
    if str(case.client_id) != user["user_id"]:
        db.close()
        raise HTTPException(status_code=403, detail="Access denied")

    if case.status != "ACTIVE":
        db.close()
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
    # Load existing evidence
    # =========================
    evidence_data = case.evidence if case.evidence else {}

    if claim not in evidence_data:
        evidence_data[claim] = []

    # =========================
    # Save files
    # =========================
    for file in files:
        file_path = os.path.join(claim_dir, file.filename)

        with open(file_path, "wb") as f:
            f.write(file.file.read())

        evidence_data[claim].append({
            "filename": file.filename,
            "path": file_path,
            "uploaded_at": datetime.utcnow().isoformat()
        })

    case.evidence = evidence_data
    case.stage = "FOLLOWUP"

    db.commit()
    db.close()

    return {
        "message": "Evidence uploaded successfully",
        "case_id": case_id,
        "claim": claim,
        "files_uploaded": [f.filename for f in files]
    }
