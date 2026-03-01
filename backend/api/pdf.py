from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import Case
from pdf.pdf_generator import generate_case_pdf
from auth.dependencies import require_lawyer, get_current_user

router = APIRouter(prefix="/report", tags=["final-report"])


# ==================================================
# LAWYER → GENERATE FINAL PDF REPORT
# ==================================================
@router.post("/generate/{case_id}", dependencies=[Depends(require_lawyer)])
def generate_pdf(
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
            detail="Final report can be generated only for active cases"
        )

    # 🔍 Ensure full pipeline completed
    # 🔍 Ensure minimum required data
    if not case.facts or not case.claims or not case.risk_report:
        db.close()
        raise HTTPException(
        status_code=400,
        detail="Case analysis incomplete. Cannot generate final report."
    )
   
    # 🔹 Generate PDF
    file_path = generate_case_pdf(case)

    # 🔹 Mark case as completed
    case.status = "COMPLETED"
    db.commit()
    db.close()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"case_{case_id}.pdf"
    )
