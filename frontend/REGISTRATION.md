# Registration System Documentation

## Overview

The MediConnect registration system provides role-based account creation with proper access control. The system has two types of registration:

1. **Patient Registration** - Currently requires receptionist authentication (intended for reception desk use)
2. **Staff Registration** - Admin-only access to create doctors, nurses, receptionists, and admins

## Registration Pages

### 1. Patient Registration (`/register`)

**Location:** `/src/pages/PatientRegister.jsx`  
**Route:** `/register`  
**Access:** Public route (but backend requires receptionist auth)

**Features:**

- Personal information fields (first name, last name, email, phone)
- PESEL validation (11-digit Polish national ID)
- Birth date selection
- Password creation with confirmation
- Form validation
- Medical-themed Bootstrap 5 styling

**Form Fields:**

- First Name (required)
- Last Name (required)
- Email (required, validated)
- Phone Number (optional)
- PESEL (required, 11 digits)
- Birth Date (required)
- Password (required, min 6 characters)
- Confirm Password (required, must match)

**Backend Endpoint:** `POST /patients/register`

**Important Note:** The current backend implementation requires receptionist authentication for patient registration. This is designed for in-person registration at the reception desk. To enable true public self-registration, you would need to:

1. Modify the backend endpoint to allow unauthenticated access
2. Add email verification
3. Implement CAPTCHA for spam prevention

### 2. Staff Registration (`/admin/register-staff`)

**Location:** `/src/pages/StaffRegister.jsx`  
**Route:** `/admin/register-staff`  
**Access:** Protected - Admin role only

**Features:**

- Visual role selection with colored buttons
- Dynamic form fields based on selected role
- Doctor-specific fields (specialization, license number)
- Real-time form validation
- Success/error messaging
- Form reset after successful creation

**Supported Roles:**

1. **Doctor** - Requires specialization and license number
2. **Nurse** - Basic user information only
3. **Receptionist** - Basic user information only
4. **Admin** - Basic user information only

**Form Fields (All Roles):**

- Role Selection (required)
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Phone Number (optional)
- Password (required, min 6 characters)
- Confirm Password (required, must match)

**Additional Fields (Doctor Only):**

- Specialization (required)
- License Number (required)

**Backend Endpoints:**

- Doctor: `POST /doctor/`
- Nurse: `POST /nurse/`
- Receptionist: `POST /receptionist/`
- Admin: `POST /admins/`

## Access Control

### Public Routes

- `/register` - Patient registration (note: backend requires receptionist auth)
- `/login` - Login page

### Protected Routes

- `/admin/register-staff` - Only accessible to users with `admin` role

### Authentication Requirements

**Patient Registration:**

```javascript
// Current implementation
await apiRequest("/patients/register", {
  method: "POST",
  body: JSON.stringify(registrationData),
  includeAuth: false, // No token sent
});
```

**Staff Registration:**

```javascript
// Requires admin token
await apiRequest("/doctor/", {
  method: "POST",
  body: JSON.stringify(registrationData),
  // includeAuth: true by default - token automatically included
});
```

## User Interface Design

### Common Design Elements

- **Bootstrap 5** framework for consistent styling
- **Medical theme** with healthcare-appropriate colors and icons
- **Responsive design** for all screen sizes
- **Form validation** with clear error messages
- **Loading states** during API calls
- **Password visibility toggle** for user convenience

### Color Scheme

- **Doctor:** Primary Blue (#0d6efd)
- **Nurse:** Success Green (#198754)
- **Receptionist:** Info Cyan (#0dcaf0)
- **Admin:** Warning Yellow (#ffc107)

### Icons (Bootstrap Icons)

- Doctor: `bi-person-badge`
- Nurse: `bi-heart-pulse`
- Receptionist: `bi-person-workspace`
- Admin: `bi-shield-check`
- Patient: `bi-person-plus-fill`

## Form Validation

### Patient Registration

- **Email:** Must be valid format (`user@domain.com`)
- **PESEL:** Exactly 11 digits, numbers only
- **Password:** Minimum 6 characters
- **Passwords Match:** Confirm password must match password
- **All Required Fields:** Must be filled

### Staff Registration

- **Email:** Must be valid format
- **Password:** Minimum 6 characters
- **Passwords Match:** Confirm password must match password
- **Doctor Specialization:** Required for doctors only
- **Doctor License:** Required for doctors only
- **All Required Fields:** Must be filled

## Integration with Backend

### Patient Registration Schema

```python
class PatientCreate(UserBase, PatientBase):
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
    pesel: str  # 11-digit national ID
    birth_date: date
```

### Doctor Registration Schema

```python
class DoctorCreate(UserBase, DoctorBase):
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
    specialization: str
    license_number: str
    role: Literal["doctor"] = "doctor"
```

### Nurse/Receptionist Registration Schema

```python
class NurseCreate(UserBase):
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
    role: Literal["nurse"] = "nurse"
```

### Admin Registration Schema

```python
class AdminBase(BaseModel):
    password: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str]
```

## Navigation

### From Homepage

- Click "Register" button in navbar → Patient registration

### From Admin Dashboard

- User dropdown menu → "Register Staff" option (admin only)

### From Navbar (Authenticated Admin)

- Dropdown menu shows "Register Staff" link

## Error Handling

### Common Errors

1. **Email Already Exists**

   - Message: "Email already registered" or "A patient with this email already exists"
   - Solution: Use a different email address

2. **PESEL Already Exists** (Patients only)

   - Message: "A patient with this PESEL already exists"
   - Solution: Contact support if this is an error

3. **Invalid Email Format**

   - Message: "Please enter a valid email address"
   - Solution: Check email format (must include @ and domain)

4. **Password Too Short**

   - Message: "Password must be at least 6 characters long"
   - Solution: Use a longer password

5. **Passwords Don't Match**

   - Message: "Passwords do not match"
   - Solution: Re-enter matching passwords

6. **Missing Required Fields**

   - Message: "Please fill in all required fields"
   - Solution: Complete all fields marked with \*

7. **License Number Exists** (Doctors only)
   - Message: "License number already exists"
   - Solution: Check the license number or contact admin

## Security Considerations

### Current Implementation

- Passwords are sent in plain text over HTTPS (ensure SSL/TLS in production)
- Backend hashes passwords using bcrypt
- JWT tokens for authentication
- Role-based access control

### Recommendations

1. **Enable HTTPS** in production
2. **Add email verification** for patient self-registration
3. **Implement CAPTCHA** to prevent bot registrations
4. **Add password strength indicator**
5. **Consider two-factor authentication** for staff accounts
6. **Implement account lockout** after failed attempts
7. **Add audit logging** for admin actions

## Usage Examples

### Creating a Patient Account (Reception Desk)

1. Navigate to `/register`
2. Fill in patient information
3. Enter PESEL and birth date
4. Create secure password
5. Submit form
6. Patient can now log in at `/login`

### Creating Staff Accounts (Admin)

1. Log in as admin
2. Click user dropdown → "Register Staff"
3. Select staff role (Doctor/Nurse/Receptionist/Admin)
4. Fill in personal information
5. For doctors: Add specialization and license number
6. Set initial password
7. Submit form
8. Staff member can now log in with provided credentials

## Customization

### Adding New Fields

To add fields to patient registration:

```javascript
// 1. Update formData state
const [formData, setFormData] = useState({
  // ... existing fields
  new_field: "",
});

// 2. Add input in form
<input
  type="text"
  name="new_field"
  value={formData.new_field}
  onChange={handleChange}
/>;

// 3. Update backend schema to accept new field
```

### Styling Changes

All styles are in `/src/styles/custom.css`. Key classes:

- `.btn-check:checked` - Radio button selection colors
- Form section styling with `<hr>` separators
- Alert styling for errors and success messages

## Future Enhancements

- [ ] Public patient self-registration with email verification
- [ ] SMS verification for phone numbers
- [ ] Bulk staff import (CSV/Excel)
- [ ] Profile picture upload during registration
- [ ] Terms of service acceptance checkbox
- [ ] GDPR compliance notifications
- [ ] Multi-language support
- [ ] Social login integration
- [ ] Password strength meter
- [ ] Real-time email availability checking
- [ ] Account activation workflow
- [ ] Welcome email after registration

## Troubleshooting

### "Registration failed" Error

- Check if backend is running
- Verify API endpoint URLs
- Check browser console for detailed errors
- Ensure authentication token is valid (for staff registration)

### Form Submission Does Nothing

- Check for JavaScript errors in console
- Verify all required fields are filled
- Check network tab for failed requests

### Can't Access Staff Registration

- Ensure you're logged in as admin
- Check that user role is exactly "admin"
- Verify ProtectedRoute is working correctly

### Backend Returns 401 Unauthorized

- For staff registration: Ensure admin is logged in
- Check that JWT token is valid and not expired
- Verify apiClient is including authorization header

---

**Note:** Remember that patient registration currently requires receptionist authentication on the backend. Consider modifying the backend to enable true public patient registration if needed for your use case.
