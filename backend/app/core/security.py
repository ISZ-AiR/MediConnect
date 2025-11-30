from datetime import datetime, timedelta
from typing import Optional, TYPE_CHECKING
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

if TYPE_CHECKING:
    from models import User

# Move this to environment variables in production
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Verify and decode a JWT token."""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        email: str = payload.get("email")

        if user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {
            "user_id": int(user_id),
            "role": role,
            "email": email
        }
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(allowed_roles: list):
    """
    Dependency that checks if the current user has one of the allowed roles.
    Usage: current_user = Depends(require_role(["admin", "receptionist"]))
    """
    def role_checker(current_user: dict = Depends(verify_token)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker


async def _get_db_session():
    """Helper to get database session for dependency injection"""
    from core.database import get_db
    async for session in get_db():
        return session


async def get_current_user(
    token_data: dict = Depends(verify_token),
    db: AsyncSession = Depends(_get_db_session)
) -> "User":
    """
    Get the full user object from the database based on the token.
    This dependency fetches the complete User model from the database.

    Usage: current_user: User = Depends(get_current_user)

    Returns the full User model instance with all attributes.
    """
    # Import locally to avoid circular imports
    from models.user_model import User

    result = await db.execute(select(User).where(User.user_id == token_data["user_id"]))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def require_role_with_user(allowed_roles: list):
    """
    Dependency that returns the full User model AND checks role permissions.
    Combines get_current_user with role checking.

    Usage: current_user: User = Depends(require_role_with_user(["admin", "receptionist"]))

    This is more efficient than get_current_user + manual role check.
    """
    async def role_and_user_checker(
        token_data: dict = Depends(verify_token),
        db: AsyncSession = Depends(_get_db_session)
    ) -> "User":
        # Check role from token first (no DB query needed)
        if token_data["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required roles: {', '.join(allowed_roles)}"
            )

        # Then fetch full user from database
        from models.user_model import User
        result = await db.execute(select(User).where(User.user_id == token_data["user_id"]))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    return role_and_user_checker
