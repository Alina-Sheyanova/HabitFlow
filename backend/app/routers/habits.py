from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Habit, HabitCompletion
from ..schemas import ActivityResponse, HabitCreate, HabitResponse, ToggleRequest

router = APIRouter(prefix="/habits", tags=["habits"])


def _serialize(habit: Habit) -> HabitResponse:
    return HabitResponse(
        id=habit.id,
        name=habit.name,
        description=habit.description,
        goalDays=habit.goal_days,
        createdAt=habit.created_at.isoformat(),
        completedDates=[c.completed_date.isoformat() for c in habit.completions],
    )


@router.get("/activity", response_model=ActivityResponse)
async def get_activity(db: AsyncSession = Depends(get_db)) -> ActivityResponse:
    result = await db.execute(select(HabitCompletion))
    activity: dict[str, int] = {}
    for c in result.scalars().all():
        key = c.completed_date.isoformat()
        activity[key] = activity.get(key, 0) + 1
    return ActivityResponse(activity=activity)


@router.get("/", response_model=list[HabitResponse])
async def list_habits(db: AsyncSession = Depends(get_db)) -> list[HabitResponse]:
    result = await db.execute(select(Habit).order_by(Habit.created_at))
    return [_serialize(h) for h in result.scalars().all()]


@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    body: HabitCreate, db: AsyncSession = Depends(get_db)
) -> HabitResponse:
    habit = Habit(
        name=body.name,
        description=body.description,
        goal_days=body.goal_days,
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return _serialize(habit)


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str, db: AsyncSession = Depends(get_db)
) -> None:
    result = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = result.scalar_one_or_none()
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    await db.delete(habit)
    await db.commit()


@router.post("/{habit_id}/toggle", response_model=HabitResponse)
async def toggle_completion(
    habit_id: str,
    body: ToggleRequest,
    db: AsyncSession = Depends(get_db),
) -> HabitResponse:
    result = await db.execute(select(Habit).where(Habit.id == habit_id))
    habit = result.scalar_one_or_none()
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")

    target_date = date.fromisoformat(body.date)

    existing = await db.execute(
        select(HabitCompletion).where(
            HabitCompletion.habit_id == habit_id,
            HabitCompletion.completed_date == target_date,
        )
    )
    completion = existing.scalar_one_or_none()

    if completion:
        await db.delete(completion)
    else:
        db.add(HabitCompletion(habit_id=habit_id, completed_date=target_date))

    await db.commit()
    await db.refresh(habit)
    return _serialize(habit)
