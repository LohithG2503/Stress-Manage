import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LogMetrics from "./pages/LogMetrics";
import EmployeeHistory from "./pages/EmployeeHistory";
import StressAssessment from "./pages/StressAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import EmployeeAssessments from "./pages/EmployeeAssessments";
import HRDashboard from "./pages/HRDashboard";
import HREmployees from "./pages/HREmployees";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/log"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <LogMetrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/history"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/assessment"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <StressAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/assessment/results"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <AssessmentResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/assessments"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <EmployeeAssessments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/employees"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <HREmployees />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
