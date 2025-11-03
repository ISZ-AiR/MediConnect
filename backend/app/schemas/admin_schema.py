from pydantic import BaseModel, EmailStr, Field

# ----- ADMIN -----

class AdminBase(BaseModel):
    """
    Base schema for admin user creation.
    """
    first_name: str = Field(..., example="Jan")
    last_name: str = Field(..., example="Kowalski")
    email: EmailStr = Field(..., example="admin@example.com")
    phone: str | None = Field(None, example="+48 123 456 789")
    password: str = Field(..., min_length=6, example="securePassword123")


class AdminModel(BaseModel):
    """
    Returned admin data.
    """
    user_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None
    role: str

    class Config:
        from_attributes = True
