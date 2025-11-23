#!/usr/bin/env python3
"""
Script to create or reset the admin user password.

Usage:
    python scripts/reset_admin.py
"""

from app.models.user_model import User
from app.core.database import async_session
from passlib.context import CryptContext
from sqlalchemy import select
import asyncio
import sys
import os

# Add parent directory to path to import from app
sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def reset_admin_password():
    """Reset or create admin user with default credentials."""

    print("🔧 Admin User Reset Tool")
    print("=" * 50)

    try:
        async with async_session() as session:
            # Check if admin exists
            result = await session.execute(
                select(User).where(User.email == "admin@mediconnect.com")
            )
            admin_user = result.scalars().first()

            if admin_user:
                print("✅ Admin user found!")
                print(
                    f"   Name: {admin_user.first_name} {admin_user.last_name}")
                print(f"   Email: {admin_user.email}")
                print(f"   Role: {admin_user.role}")
                print()

                # Ask if user wants to reset password
                reset = await asyncio.to_thread(
                    input,
                    "Do you want to reset the password? (yes/no): "
                )
                reset = reset.strip().lower()

                if reset == 'yes':
                    new_password = await asyncio.to_thread(
                        input,
                        "Enter new password (press Enter for 'admin123'): "
                    )
                    new_password = new_password.strip()
                    if not new_password:
                        new_password = "admin123"

                    admin_user.password_hash = pwd_context.hash(new_password)
                    await session.commit()
                    print()
                    print("✅ Password reset successfully!")
                    print("   Email: admin@mediconnect.com")
                    print(f"   Password: {new_password}")
                else:
                    print("Operation cancelled.")

            else:
                print("❌ Admin user not found. Creating new admin...")
                print()

                # Create new admin
                hashed_password = pwd_context.hash("admin123")

                new_admin = User(
                    first_name="Admin",
                    last_name="User",
                    email="admin@mediconnect.com",
                    phone="+48123456789",
                    password_hash=hashed_password,
                    role="admin"
                )

                session.add(new_admin)
                await session.commit()

                print("✅ Admin user created successfully!")
                print("   Email: admin@mediconnect.com")
                print("   Password: admin123")
                print()
                print("⚠️  IMPORTANT: Change this password in production!")

    except Exception as e:
        print(f"❌ Error: {e}")
        raise

    print()
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(reset_admin_password())
