"""Farm tasks and work planner API.

Endpoints:
  GET    /api/farmer/tasks            — list tasks with optional filters
  GET    /api/farmer/tasks/summary    — aggregate task counts (due today, overdue, etc.)
  POST   /api/farmer/tasks            — create a task
  PATCH  /api/farmer/tasks/{id}/status — mark complete / pending / skipped
  PUT    /api/farmer/tasks/{id}        — update / reschedule a task
  DELETE /api/farmer/tasks/{id}        — delete a task
"""
from datetime import date, datetime, timezone
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.auth import get_current_user
from db.models import FarmTask, FarmerField, User
from db.session import get_db
from schemas.task import (
    FarmTaskCreate,
    FarmTaskResponse,
    FarmTaskStatusUpdate,
    FarmTaskSummary,
    FarmTaskUpdate,
)

router = APIRouter()


def _verify_field_ownership(db: Session, user_id: int, field_id: Optional[int]) -> None:
    if field_id is None:
        return
    field = db.query(FarmerField).filter(
        FarmerField.id == field_id, FarmerField.user_id == user_id
    ).first()
    if not field:
        raise HTTPException(status_code=404, detail="Farm field not found")


@router.get("/tasks", response_model=List[FarmTaskResponse])
def list_farm_tasks(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    field_id: Optional[int] = Query(default=None),
    category: Optional[str] = Query(default=None),
    timeframe: Optional[str] = Query(default=None, description="today, overdue, upcoming"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """List tasks belonging to the authenticated farmer."""
    today = date.today()
    query = db.query(FarmTask).filter(FarmTask.user_id == current_user.id)

    if field_id is not None:
        _verify_field_ownership(db, current_user.id, field_id)
        query = query.filter(FarmTask.field_id == field_id)

    if category:
        query = query.filter(FarmTask.category == category)

    if status_filter:
        query = query.filter(FarmTask.status == status_filter)

    if timeframe == "today":
        query = query.filter(FarmTask.due_date == today, FarmTask.status == "pending")
    elif timeframe == "overdue":
        query = query.filter(FarmTask.due_date < today, FarmTask.status == "pending")
    elif timeframe == "upcoming":
        query = query.filter(FarmTask.due_date > today, FarmTask.status == "pending")

    return query.order_by(FarmTask.due_date.asc(), FarmTask.id.desc()).all()


@router.get("/tasks/summary", response_model=FarmTaskSummary)
def get_task_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Get count summary of tasks for the dashboard."""
    today = date.today()
    base_query = db.query(FarmTask).filter(FarmTask.user_id == current_user.id)

    total_count = base_query.count()
    due_today_count = base_query.filter(FarmTask.due_date == today, FarmTask.status == "pending").count()
    overdue_count = base_query.filter(FarmTask.due_date < today, FarmTask.status == "pending").count()
    upcoming_count = base_query.filter(FarmTask.due_date > today, FarmTask.status == "pending").count()
    completed_count = base_query.filter(FarmTask.status == "completed").count()

    return FarmTaskSummary(
        total_count=total_count,
        due_today_count=due_today_count,
        overdue_count=overdue_count,
        upcoming_count=upcoming_count,
        completed_count=completed_count,
    )


@router.post("/tasks", response_model=FarmTaskResponse, status_code=status.HTTP_201_CREATED)
def create_farm_task(
    task_in: FarmTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Create a new farm task."""
    _verify_field_ownership(db, current_user.id, task_in.field_id)
    task = FarmTask(user_id=current_user.id, **task_in.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}/status", response_model=FarmTaskResponse)
def update_task_status(
    task_id: int,
    body: FarmTaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Mark a task as completed, pending, or skipped."""
    task = db.query(FarmTask).filter(
        FarmTask.id == task_id, FarmTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Farm task not found")

    task.status = body.status
    if body.status == "completed":
        task.completed_at = datetime.now(timezone.utc)
    else:
        task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=FarmTaskResponse)
def update_farm_task(
    task_id: int,
    task_in: FarmTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Any:
    """Update or reschedule an existing farm task."""
    task = db.query(FarmTask).filter(
        FarmTask.id == task_id, FarmTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Farm task not found")

    values = task_in.model_dump(exclude_unset=True)
    if "field_id" in values:
        _verify_field_ownership(db, current_user.id, values["field_id"])

    for key, value in values.items():
        setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a farm task."""
    task = db.query(FarmTask).filter(
        FarmTask.id == task_id, FarmTask.user_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Farm task not found")

    db.delete(task)
    db.commit()
