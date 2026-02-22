import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Habit(Base):
    __tablename__ = "habits"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    goal_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)

    completions: Mapped[list["HabitCompletion"]] = relationship(
        "HabitCompletion",
        back_populates="habit",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class HabitCompletion(Base):
    __tablename__ = "habit_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    habit_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("habits.id", ondelete="CASCADE"), nullable=False
    )
    completed_date: Mapped[date] = mapped_column(Date, nullable=False)

    __table_args__ = (
        UniqueConstraint("habit_id", "completed_date", name="uq_habit_date"),
    )

    habit: Mapped["Habit"] = relationship("Habit", back_populates="completions")
