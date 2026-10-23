"""Pydantic schemas for Farm Tasks and Planner."""
from datetime import date, datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field

TaskCategory = Literal[
    "irrigation",
    "fertilizer",
    "pesticide",
    "soil_test",
    "harvest",
    "scouting",
    "buyer_followup",
    "general"
]
TaskPriority = Literal["low", "medium", "high", "urgent"]
TaskStatus = Literal["pending", "completed", "skipped"]


class FarmTaskCreate(BaseModel):
    field_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: TaskCategory = "general"
    priority: TaskPriority = "medium"
    status: TaskStatus = "pending"
    due_date: date
    is_ai_recommended: Optional[bool] = False


class FarmTaskUpdate(BaseModel):
    field_id: Optional[int] = None
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[TaskCategory] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[date] = None


class FarmTaskStatusUpdate(BaseModel):
    status: TaskStatus
    completed_at: Optional[datetime] = None


class FarmTaskResponse(BaseModel):
    id: int
    user_id: int
    field_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    category: str
    priority: str
    status: str
    due_date: date
    completed_at: Optional[datetime] = None
    is_ai_recommended: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class FarmTaskSummary(BaseModel):
    total_count: int
    due_today_count: int
    overdue_count: int
    upcoming_count: int
    completed_count: int
