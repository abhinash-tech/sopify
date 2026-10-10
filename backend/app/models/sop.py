from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class SOPRecord(Base):
    __tablename__ = "sops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(180), index=True)
    process_name: Mapped[str] = mapped_column(String(180), index=True)
    department: Mapped[str] = mapped_column(String(120), default="Operations", index=True)
    objective: Mapped[str] = mapped_column(Text, default="")
    industry: Mapped[str | None] = mapped_column(String(120), nullable=True)
    audience: Mapped[str | None] = mapped_column(String(120), nullable=True)
    complexity: Mapped[str | None] = mapped_column(String(50), nullable=True, default="Medium")
    status: Mapped[str] = mapped_column(String(24), default="draft", index=True)
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    sop_content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
