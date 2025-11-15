import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import PatientRegister from "./pages/PatientRegister";
import StaffRegister from "./pages/StaffRegister";
import PatientDashboard from "./pages/PatientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />

            {/* Public Registration */}
            <Route path="/register" element={<PatientRegister />} />

            {/* Admin-only Staff Registration */}
            <Route
              path="/admin/register-staff"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <StaffRegister />
                </ProtectedRoute>
              }
            />

              <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes for other roles - add components later */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <div className="container mt-5">
                    <h1>Doctor Dashboard</h1>
                    <p>Coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/nurse/dashboard"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <div className="container mt-5">
                    <h1>Nurse Dashboard</h1>
                    <p>Coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <div className="container mt-5">
                    <h1>Receptionist Dashboard</h1>
                    <p>Coming soon...</p>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Add more routes as needed */}
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={1500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover={false}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
