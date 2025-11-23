# Default Admin User

## Overview

When you start the MediConnect backend application for the first time, a default admin user is automatically created if no admin exists in the database.

## Default Credentials

```
Email:    admin@mediconnect.com
Password: admin123
```

⚠️ **IMPORTANT SECURITY NOTE**: These are default credentials for development and testing purposes only. **Change these credentials immediately in production environments!**

## How It Works

The default admin user is created automatically during application startup via the `create_default_admin()` function in `core/init_db.py`. The function:

1. Checks if any admin user exists in the database
2. If no admin exists, creates a new admin user with default credentials
3. Logs the creation for visibility
4. Skips creation if an admin already exists

## Login Process

1. Start your backend server
2. The default admin will be created (if needed)
3. Navigate to your frontend login page: `http://localhost:5173/login`
4. Enter the default credentials:
   - Email: `admin@mediconnect.com`
   - Password: `admin123`
5. You'll be redirected to the admin dashboard

## Resetting Admin Password

If you forget the admin password or need to reset it, use the provided script:

```bash
cd backend
python scripts/reset_admin.py
```

This script will:

- Find the existing admin user
- Allow you to reset the password
- Or create a new admin if none exists

## Creating Additional Admins

Once logged in as admin, you can create additional admin accounts:

1. Log in with the default admin credentials
2. Navigate to the admin dropdown in the navbar
3. Click "Register Staff"
4. Select "Admin" role
5. Fill in the form and create a new admin account

## Security Best Practices

### For Development

- The default credentials are fine for local development
- Keep them documented for team members

### For Production

1. **Change the default password immediately** after first login
2. **Create a new admin user** with a strong password
3. **Delete or disable** the default admin account
4. **Use environment variables** for admin credentials instead of hardcoded values
5. **Enable two-factor authentication** if implemented
6. **Use strong, unique passwords** (at least 12 characters with mixed case, numbers, and symbols)
7. **Regularly rotate passwords**
8. **Audit admin access logs**

## Disabling Default Admin Creation

If you want to disable automatic default admin creation (e.g., in production), you can comment out the `create_default_admin()` call in `main.py`:

```python
# In app/main.py, comment out this line:
# await create_default_admin()
```

## Manual Admin Creation

If you need to manually create an admin user via database:

```python
# Using Python script
from passlib.context import CryptContext
from app.models.user_model import User
from app.core.database import async_session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    async with async_session() as session:
        admin = User(
            first_name="Your",
            last_name="Name",
            email="your.email@example.com",
            phone="+48123456789",
            password_hash=pwd_context.hash("your_secure_password"),
            role="admin"
        )
        session.add(admin)
        await session.commit()
```

## Troubleshooting

### Can't Log In

- Verify the backend is running
- Check database connection
- Ensure tables are created (check logs)
- Verify email is exactly: `admin@mediconnect.com`
- Password is case-sensitive: `admin123`

### Admin Not Created

- Check application startup logs
- Ensure database connection is working
- Run `python scripts/reset_admin.py` to manually create

### Multiple Admins

- Use the admin interface to manage other admins
- Delete unnecessary accounts
- Keep track of who has admin access

## Related Documentation

- [Authentication System](../frontend/AUTHENTICATION.md)
- [Registration System](../frontend/REGISTRATION.md)
- [User Management](./USER_MANAGEMENT.md) (if exists)

---

**Remember**: Security is crucial for healthcare applications. Always follow best practices and never use default credentials in production!
