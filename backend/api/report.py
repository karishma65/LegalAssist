from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from pdf.pdf_generator import generate_case_pdf
import os
import traceback
import uuid

router = APIRouter(prefix="/report", tags=["Report"])


# ✅ Use GET for file downloads
@router.get("/generate/{case_id}")
def generate_report(case_id: str):

    db: Session = SessionLocal()

    try:
        # =========================
        # Convert string to UUID
        # =========================
        try:
            case_uuid = uuid.UUID(case_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid Case ID format"
            )

        # =========================
        # Fetch Case
        # =========================
        case = db.query(Case).filter(
            Case.case_id == case_uuid
        ).first()

        if case is None:
            raise HTTPException(
                status_code=404,
                detail="Case not found"
            )

        # =========================
        # Generate PDF
        # =========================
        file_path = generate_case_pdf(case)

        if not file_path or not os.path.exists(file_path):
            raise HTTPException(
                status_code=500,
                detail="PDF generation failed"
            )

        # =========================
        # MARK CASE COMPLETED
        # =========================
        case.status = "COMPLETED"
        db.commit()

        # =========================
        # Return File
        # =========================
        return FileResponse(
            path=file_path,
            media_type="application/pdf",
            filename=f"Case_Report_{case_id}.pdf"
        )

    except HTTPException:
        raise

    except Exception as e:
        print("🔥 REPORT ERROR 🔥")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Internal Server Error during PDF generation"
        )

    finally:
        db.close()