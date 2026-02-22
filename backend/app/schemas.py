from datetime import date

from pydantic import BaseModel, field_validator


class HabitCreate(BaseModel):
    name: str
    description: str | None = None
    goal_days: int | None = None

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name must not be blank")
        return v.strip()


class ToggleRequest(BaseModel):
    date: str

    @field_validator("date")
    @classmethod
    def validate_date_format(cls, v: str) -> str:
        date.fromisoformat(v)
        return v


class HabitResponse(BaseModel):
    id: str
    name: str
    description: str | None
    goalDays: int | None
    createdAt: str
    completedDates: list[str]

    model_config = {
        "from_attributes": True,
    }


class ActivityResponse(BaseModel):
    activity: dict[str, int]
