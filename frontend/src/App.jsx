import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./layouts/Layout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentLeave from "./pages/student/StudentLeave";
import Profile from "./pages/Profile";
import DownloadPDF from "./pages/DownloadPDF";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageSubjects from "./pages/admin/ManageSubjects";
import AttendanceReports from "./pages/admin/AttendanceReports";
import LeaveRequests from "./pages/admin/LeaveRequests";
import Settings from "./pages/admin/Settings";

// Gemini AI Chatbot
import GeminiChatbot from "./components/GeminiChatbot";

// Role-based redirect
import RoleBasedRedirect from "./components/RoleBasedRedirect";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Student Routes */}
            <Route path="student/dashboard" element={<StudentDashboard />} />
            <Route path="student/attendance" element={<StudentAttendance />} />
            <Route path="student/leave" element={<StudentLeave />} />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/students" element={<ManageStudents />} />
            <Route path="admin/subjects" element={<ManageSubjects />} />
            <Route path="admin/attendance" element={<AttendanceReports />} />
            <Route path="admin/leave-requests" element={<LeaveRequests />} />
            <Route path="admin/settings" element={<Settings />} />

            {/* Common Routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="download-pdf" element={<DownloadPDF />} />
            <Route path="ai-chatbot" element={<GeminiChatbot />} />

            {/* Default redirect - Role-based */}
            <Route path="/" element={<RoleBasedRedirect />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
