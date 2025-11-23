# Authentication System Documentation

## Overview

The MediConnect authentication system provides secure login/logout functionality with role-based access control. It integrates with the FastAPI backend using OAuth2 password flow with JWT tokens.

## Components

### 1. AuthContext (`/src/context/AuthContext.jsx`)

The authentication context provides authentication state and methods throughout the application.

**Features:**

- Manages authentication state (user, token, isAuthenticated)
- Persists auth data to localStorage
- Automatic token expiration checking
- Login, logout, and register functionality

**Available Methods:**

```javascript
const {
  user, // Current user object { email, role }
  token, // JWT access token
  isAuthenticated, // Boolean authentication status
  loading, // Loading state
  login, // Login function (email, password)
  logout, // Logout function
  register, // Register function (userData)
} = useAuth();
```

**Usage:**

```javascript
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.email}!</div>;
  }
  return <div>Please log in</div>;
}
```

### 2. Login Page (`/src/pages/Login.jsx`)

Professional login page with Bootstrap 5 styling.

**Features:**

- Email and password authentication
- Form validation
- Show/hide password toggle
- Error handling with user-friendly messages
- Remember me checkbox
- Role-based redirect after login
- Links to password reset and registration

**Role-Based Redirects:**

- `patient` → `/patient/dashboard`
- `doctor` → `/doctor/dashboard`
- `nurse` → `/nurse/dashboard`
- `receptionist` → `/receptionist/dashboard`
- `admin` → `/admin/dashboard`

### 3. ProtectedRoute Component (`/src/components/ProtectedRoute.jsx`)

Higher-order component for protecting routes that require authentication.

**Features:**

- Redirects unauthenticated users to login
- Role-based access control
- Loading state handling
- Access denied page for unauthorized roles

**Usage:**

```javascript
import ProtectedRoute from './components/ProtectedRoute';

// Protect a route (any authenticated user)
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Protect a route with role restriction
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

// Multiple roles allowed
<Route
  path="/medical/records"
  element={
    <ProtectedRoute allowedRoles={['doctor', 'nurse']}>
      <MedicalRecords />
    </ProtectedRoute>
  }
/>
```

### 4. Navbar Component (Updated)

The navbar now shows authentication state and user information.

**Features:**

- Shows login/register buttons when not authenticated
- Shows user dropdown menu when authenticated
- Displays user email and role
- Profile and settings links
- Logout functionality

### 5. Auth Service (`/src/services/authService.js`)

Service layer for authentication API calls.

**Available Methods:**

- `login(email, password)` - Login user
- `register(userData)` - Register new user
- `getProfile()` - Get current user profile
- `updateProfile(userData)` - Update user profile
- `logout()` - Clear local storage

## Backend Integration

### API Endpoint

The system connects to your FastAPI backend's `/login` endpoint:

**Request Format:**

```
POST /login
Content-Type: application/x-www-form-urlencoded

username=email@example.com&password=yourpassword
```

**Response Format:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "email": "user@example.com",
  "role": "patient"
}
```

### Token Storage

- JWT tokens are stored in `localStorage` under the key `authToken`
- User data is stored under the key `user`
- Tokens are automatically included in API requests via the `apiClient`

### Token Expiration

The system automatically checks token expiration on:

- Application initialization
- Each protected route access
- Before making authenticated API calls

Expired tokens trigger automatic logout and redirect to login page.

## Security Features

1. **JWT Token Validation** - Checks token structure and expiration
2. **Automatic Token Refresh** - Clears expired tokens
3. **Protected Routes** - Prevents unauthorized access
4. **Role-Based Access Control** - Restricts access by user role
5. **Secure Password Input** - Password masking with toggle
6. **HTTPS Ready** - Designed for secure transmission
7. **XSS Protection** - React's built-in protection

## User Roles

The system supports the following roles:

- `patient` - Regular patients
- `doctor` - Medical doctors
- `nurse` - Nursing staff
- `receptionist` - Front desk staff
- `admin` - System administrators

## Setup Instructions

### 1. Wrap App with AuthProvider

Already configured in `/src/App.jsx`:

```javascript
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>{/* Your routes */}</Router>
    </AuthProvider>
  );
}
```

### 2. Add Login Route

Already configured in `/src/App.jsx`:

```javascript
<Route path="/login" element={<Login />} />
```

### 3. Protect Routes

Use the `ProtectedRoute` component:

```javascript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Usage Examples

### Login a User

```javascript
import { useAuth } from "../context/AuthContext";

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);

    if (result.success) {
      // Redirect or show success
    } else {
      // Show error message
      console.error(result.error);
    }
  };
}
```

### Check Authentication Status

```javascript
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>
          Welcome, {user.email}! Role: {user.role}
        </p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Logout

```javascript
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Testing

### Test Credentials

Set up test users in your backend with different roles:

```python
# Example test users
{
  "email": "patient@test.com",
  "password": "password123",
  "role": "patient"
}
{
  "email": "doctor@test.com",
  "password": "password123",
  "role": "doctor"
}
```

## Troubleshooting

### "Invalid credentials" error

- Check that the backend is running
- Verify the email and password are correct
- Check the API endpoint URL in constants

### Token not persisting

- Check browser localStorage settings
- Clear cache and try again
- Check for console errors

### Protected routes not working

- Ensure `AuthProvider` wraps the entire app
- Check that routes are properly wrapped with `ProtectedRoute`
- Verify token is valid and not expired

### CORS errors

- Ensure backend allows the frontend origin
- Check CORS configuration in FastAPI

## Future Enhancements

Consider adding:

- [ ] Refresh token functionality
- [ ] Two-factor authentication
- [ ] Social login (Google, Facebook)
- [ ] Password strength indicator
- [ ] Account activation via email
- [ ] Password reset functionality
- [ ] Session timeout warnings
- [ ] Audit logging for security events
