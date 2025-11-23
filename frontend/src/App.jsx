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
import ResourcesIndex from "./pages/ResourcesIndex";
import DoctorDashboard from "./pages/DoctorDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import ManagerDashboard from './pages/ManagerDashboard';
import About from "./pages/About";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AppointmentsIndex from "./pages/AppointmentsIndex";
import DoctorsList from "./pages/DoctorsList";
import NursesList from "./pages/NursesList";
import PatientsList from "./pages/PatientsList";
import ReceptionistsList from "./pages/ReceptionistsList";
import AdminsList from "./pages/AdminsList";
import ReservationsList from "./pages/ReservationsList";
import VisitsList from "./pages/VisitsList";
import PrescriptionsList from "./pages/PrescriptionsList";
import ReferralsList from "./pages/ReferralsList";
import ExaminationsList from "./pages/ExaminationsList";
import SchedulesList from "./pages/SchedulesList";
import ManagersList from "./pages/ManagersList";
import ScheduleDetail from "./pages/ScheduleDetail";
import ScheduleForm from "./pages/ScheduleForm";
import DoctorDetail from "./pages/DoctorDetail";
import DoctorForm from "./pages/DoctorForm";
import PatientDetail from "./pages/PatientDetail";
import PatientForm from "./pages/PatientForm";
import PatientBooking from "./pages/PatientBooking";
import ReservationDetail from "./pages/ReservationDetail";
import ReservationForm from "./pages/ReservationForm";
import ExaminationDetail from "./pages/ExaminationDetail";
import ExaminationForm from "./pages/ExaminationForm";
import VisitDetail from "./pages/VisitDetail";
import VisitForm from "./pages/VisitForm";
import PrescriptionDetail from "./pages/PrescriptionDetail";
import PrescriptionForm from "./pages/PrescriptionForm";
import ReferralDetail from "./pages/ReferralDetail";
import ReferralForm from "./pages/ReferralForm";
import ManagerDetail from "./pages/ManagerDetail";
import ManagerForm from "./pages/ManagerForm";
import DoctorWorkload from './pages/reports/DoctorWorkload';
import ReservationsSummary from './pages/reports/ReservationsSummary';
import Examinations from './pages/reports/Examinations';
import DoctorAvailability from './pages/reports/DoctorAvailability.jsx';
import PatientRecordsList from "./pages/PatientRecordsList.jsx";
import PatientRecordsDetail from "./pages/PatientRecordsDetail.jsx";

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
            <Route
              path="/admin/reservations/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReservationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservations/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReservationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservations/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReservationForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/doctors/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/patients/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/patients/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PatientForm />
                </ProtectedRoute>
              }
            />

            <Route path="/book" element={<PatientBooking />} />

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

            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ResourcesIndex />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DoctorsList />
                </ProtectedRoute>
              }
            />

            <Route path="/doctors" element={<DoctorsList />} />

            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PatientsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/nurses"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <NursesList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/patients"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PatientsList />
                </ProtectedRoute>
              }
            />

            <Route path="/appointments" element={<AppointmentsIndex />} />
            <Route path="/appointments/book" element={<PatientBooking />} />
            <Route path="/book" element={<PatientBooking />} />

            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              path="/admin/receptionists"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReceptionistsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/admins"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/managers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/managers/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/managers/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/managers/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManagerForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reservations"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReservationsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/visits"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VisitsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/visits/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VisitForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/visits/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VisitDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/visits/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VisitForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/prescriptions"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                  <PrescriptionsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/prescriptions/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <PrescriptionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/prescriptions/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                  <PrescriptionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/prescriptions/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <PrescriptionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/referrals"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <ReferralsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/referrals/create"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <ReferralForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/referrals/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <ReferralDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/referrals/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                  <ReferralForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/examinations"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ExaminationsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/examinations/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ExaminationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/examinations/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ExaminationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/examinations/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ExaminationForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SchedulesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules/create"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ScheduleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ScheduleDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/schedules/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ScheduleForm />
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

            <Route
              path="/patient/records"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientRecordsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/records/:id"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientRecordsDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/prescriptions"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PrescriptionsList />
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes for other roles - add components later */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/nurse/dashboard"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/reservations"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ReservationsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/visits"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <VisitsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/visits/create"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <VisitForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/visits/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <VisitDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/visits/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <VisitForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/reservations/create"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ReservationForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/reservations/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ReservationDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/reservations/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ReservationForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/patients"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <PatientsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/patients/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <PatientDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/patients/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <PatientForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/patients/create"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <PatientForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/receptionist/schedules"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <SchedulesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/schedules/create"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ScheduleForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/schedules/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ScheduleDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionist/schedules/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["receptionist"]}>
                  <ScheduleForm />
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

            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/doctor-workload"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <DoctorWorkload />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports/reservations-summary"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ReservationsSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/examinations"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Examinations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/doctor-availability"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <DoctorAvailability />
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
