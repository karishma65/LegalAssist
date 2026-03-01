from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import User
from auth.dependencies import require_client

router = APIRouter(prefix="/users", tags=["users"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ======================
# CLIENT → LIST LAWYERS
# ======================
@router.get("/lawyers", dependencies=[Depends(require_client)])
def get_lawyers(db: Session = Depends(get_db)):
    lawyers = db.query(User).filter(
        User.role == "lawyer"
    ).all()

    return [
        {
            "user_id": str(lawyer.user_id),
            "username": lawyer.username
        }
        for lawyer in lawyers
    ]
