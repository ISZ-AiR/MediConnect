# 🚀 Quick Start Testing Guide

This guide will help you quickly test your MediConnect application with the default admin account.

## Prerequisites

- Docker and Docker Compose installed
- Project cloned and `.env` configured

## Step-by-Step Testing

### 1. Start the Application

```bash
cd MediConnect
docker compose up --build
```

Wait for all services to start. You should see:

```
✅ Default admin user created successfully!
   Email: admin@mediconnect.com
   Password: admin123
```

### 2. Access the Frontend

Open your browser and navigate to:

```
http://localhost:5173
```

### 3. Login as Admin

1. Click the "Login" button in the navbar
2. Enter credentials:
   - **Email**: `admin@mediconnect.com`
   - **Password**: `admin123`
3. Click "Sign In"
4. You should be redirected to the admin dashboard

### 4. Test Staff Registration

1. Once logged in, click on your email in the navbar
2. Select "Register Staff" from the dropdown
3. Try creating different types of staff:

#### Create a Doctor

- Select "Doctor" role
- First Name: `John`
- Last Name: `Smith`
- Email: `doctor@test.com`
- Phone: `+48111222333`
- Specialization: `Cardiology`
- License Number: `MD-12345`
- Password: `doctor123`
- Confirm Password: `doctor123`
- Click "Create Doctor Account"

#### Create a Nurse

- Select "Nurse" role
- First Name: `Jane`
- Last Name: `Doe`
- Email: `nurse@test.com`
- Password: `nurse123`
- Click "Create Nurse Account"

#### Create a Receptionist

- Select "Receptionist" role
- First Name: `Alice`
- Last Name: `Johnson`
- Email: `reception@test.com`
- Password: `reception123`
- Click "Create Receptionist Account"

### 5. Test Patient Registration (Optional)

Note: Currently requires receptionist authentication on backend.

1. Navigate to: `http://localhost:5173/register`
2. Fill in patient details:
   - First Name: `Bob`
   - Last Name: `Patient`
   - Email: `patient@test.com`
   - Phone: `+48123456789`
   - PESEL: `92010112345` (11 digits)
   - Birth Date: `1992-01-01`
   - Password: `patient123`
   - Confirm Password: `patient123`
3. Click "Create Account"

### 6. Test Login with Different Roles

Log out and try logging in with the accounts you just created:

#### Doctor Login

```
Email: doctor@test.com
Password: doctor123
```

Should redirect to: `/doctor/dashboard`

#### Nurse Login

```
Email: nurse@test.com
Password: nurse123
```

Should redirect to: `/nurse/dashboard`

#### Receptionist Login

```
Email: reception@test.com
Password: reception123
```

Should redirect to: `/receptionist/dashboard`

#### Patient Login (if created)

```
Email: patient@test.com
Password: patient123
```

Should redirect to: `/patient/dashboard`

### 7. Test Access Control

Try accessing admin-only pages with non-admin accounts:

```
http://localhost:5173/admin/register-staff
```

You should see: "Access Denied - You don't have permission to access this page."

### 8. View API Documentation

Check the auto-generated API docs:

```
http://localhost:8000/docs
```

Test the health endpoint:

1. Expand `GET /health`
2. Click "Try it out"
3. Click "Execute"
4. You should see a `200` response with status data

## Testing Checklist

- [ ] Application starts without errors
- [ ] Default admin is created (check logs)
- [ ] Can access frontend at http://localhost:5173
- [ ] Can login with admin credentials
- [ ] Admin dashboard loads
- [ ] Can create a doctor account
- [ ] Can create a nurse account
- [ ] Can create a receptionist account
- [ ] Can create another admin account
- [ ] Can logout
- [ ] Can login with newly created accounts
- [ ] Each role redirects to correct dashboard
- [ ] Non-admins cannot access `/admin/register-staff`
- [ ] API documentation is accessible
- [ ] Health endpoint responds correctly

## Common Issues and Solutions

### Issue: "Admin user already exists"

**Solution**: This is normal if you've run the app before. The admin won't be recreated.

### Issue: "Failed to initialize database"

**Solution**:

1. Check if PostgreSQL container is running: `docker ps`
2. Check database credentials in `.env`
3. Check logs: `docker compose logs backend`

### Issue: "Can't login with admin credentials"

**Solution**:

1. Verify backend is running: `docker compose ps`
2. Check backend logs for errors: `docker compose logs backend`
3. Try resetting admin password: `python backend/scripts/reset_admin.py`

### Issue: "Registration failed" for staff

**Solution**:

1. Ensure you're logged in as admin
2. Check browser console for errors (F12)
3. Check backend logs: `docker compose logs backend`
4. Verify email doesn't already exist

### Issue: Patient registration not working

**Solution**:
Patient registration currently requires receptionist authentication on the backend. This is by design for reception desk use.

## Reset Everything

To start fresh:

```bash
# Stop all containers
docker compose down

# Remove volumes (⚠️ deletes all data!)
docker compose down -v

# Rebuild and start
docker compose up --build
```

## Database Access

### Using pgAdmin

1. Navigate to http://localhost:5050
2. Login with pgAdmin credentials (from `.env` or docker-compose)
3. Add server:
   - Host: `postgres-dev`
   - Port: `5432`
   - Database: `medicconnect`
   - Username: `postgres`
   - Password: (from `.env`)

### View Users Table

```sql
SELECT user_id, first_name, last_name, email, role
FROM users;
```

## Next Steps

After successful testing:

1. **Change admin password** (use the reset script or update via API)
2. **Create test data** for appointments, visits, etc.
3. **Test other features** as they're implemented
4. **Check API endpoints** in the Swagger docs
5. **Explore the database** with pgAdmin

## Need Help?

- Check the logs: `docker compose logs [service-name]`
- View backend logs: `docker compose logs backend`
- View frontend logs: `docker compose logs frontend`
- Check database: Use pgAdmin or connect directly

## Documentation

- [Default Admin Guide](./DEFAULT_ADMIN.md)
- [Authentication System](../frontend/AUTHENTICATION.md)
- [Registration System](../frontend/REGISTRATION.md)

---

Happy testing! 🏥✨
