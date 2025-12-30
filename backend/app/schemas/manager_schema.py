from pydantic import BaseModel, EmailStr, Field

class ManagerBase(BaseModel):
    first_name: str = Field(..., example="Jan")
    last_name: str = Field(..., example="Kowalski")
    email: EmailStr = Field(..., example="admin@example.com")
    phone: str | None = Field(None, example="+48 123 456 789")

class ManagerCreate(ManagerBase):
    password: str = Field(..., min_length=6, example="securePassword123")

class ManagerUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    password: str | None = None

class ManagerModel(ManagerBase):
    user_id: int
    role: str = "manager"

    class Config:
        from_attributes = True