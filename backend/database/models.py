from sqlalchemy import Column, Text, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID,JSONB
from datetime import datetime
import uuid
from database.db import Base
from sqlalchemy.orm import relationship

# ======================
# USER TABLE
# ======================
class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # client / lawyer


# =========================
# CASE REQUEST (PHASE 1)
# =========================
class CaseRequest(Base):
    __tablename__ = "case_requests"
    request_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    lawyer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    short_summary = Column(Text, nullable=False)
    urgency = Column(String, nullable=False)  # low / medium / high
    status = Column(String, default="PENDING", nullable=False)
    # PENDING | ACCEPTED | REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
# ✅ ADD THESE
    lawyer = relationship("User", foreign_keys=[lawyer_id])
    client = relationship("User", foreign_keys=[client_id])

# ======================
# CASE (PHASE 2)
# ======================
class Case(Base):
    __tablename__ = "cases"

    case_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    client_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    lawyer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=True,
        index=True
    )
 # ✅ ADD THIS
    lawyer = relationship(
        "User",
        foreign_keys=[lawyer_id],
        lazy="joined"
    )
    client = relationship("User", foreign_keys=[client_id], lazy="joined")
    facts = Column(Text, nullable=True)          # intake
    claims = Column(JSONB)        # claim_analysis
    evidence = Column(JSONB)    # evidence_upload
    followup_questions = Column(JSONB, nullable=True)
    mock_answers = Column(Text, nullable=True)   # mock_answers
    risk_report = Column(Text, nullable=True)    # gap_analysis

    status = Column(String, default="ACTIVE", nullable=False)
    # ACTIVE | COMPLETED
    description = Column(Text, nullable=True)   
    created_at = Column(DateTime, default=datetime.utcnow)

    stage = Column(
    String,
    default="INTAKE", 
    nullable=False
    )
