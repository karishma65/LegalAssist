import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

/* ---------- AUTH ---------- */
import Login from "./pages/auth/Login";
import Registration from "./pages/auth/Registration";

/* ---------- CLIENT ---------- */
import ClientDashboard from "./pages/client/ClientDashboard";
import SelectLawyer from "./pages/client/SelectLawyer";
import CaseIntake from "./pages/client/CaseIntake";
import ClaimsView from "./pages/client/ClaimsView";
import EvidenceUpload from "./pages/client/EvidenceUpload";
import FollowUpQA from "./pages/client/FollowUpQA";
import ClientRequests from "./pages/client/ClientRequests";
import ClientCases from "./pages/client/ClientCases";

/* 🔥 ADD THIS IMPORT */
import RiskAnalysis from "./pages/lawyer/RiskAnalysis";

/* ---------- LAWYER ---------- */
import LawyerDashboard from "./pages/lawyer/LawyerDashboard";
import LawyerRequests from "./pages/lawyer/LawyerRequests";
import CaseReview from "./pages/lawyer/CaseReview";
import LawyerMyCases from "./pages/lawyer/LawyerMyCases";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- DEFAULT ---------- */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ---------- AUTH ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />

        {/* ================= CLIENT ROUTES ================= */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/select-lawyer"
          element={
            <ProtectedRoute role="client">
              <SelectLawyer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/requests"
          element={
            <ProtectedRoute role="client">
              <ClientRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/cases"
          element={
            <ProtectedRoute role="client">
              <ClientCases />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/case-intake/:caseId"
          element={
            <ProtectedRoute role="client">
              <CaseIntake />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/claims/:caseId"
          element={
            <ProtectedRoute role="client">
              <ClaimsView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/evidence/:caseId"
          element={
            <ProtectedRoute role="client">
              <EvidenceUpload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/followup/:caseId"
          element={
            <ProtectedRoute role="client">
              <FollowUpQA />
            </ProtectedRoute>
          }
        />

        {/* 🔥 ADD THIS CLIENT RISK ROUTE */}
        <Route
          path="/client/risk/:caseId"
          element={
            <ProtectedRoute role="client">
              <RiskAnalysis />
            </ProtectedRoute>
          }
        />

        {/* ================= LAWYER ROUTES ================= */}
        <Route
          path="/lawyer/dashboard"
          element={
            <ProtectedRoute role="lawyer">
              <LawyerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lawyer/requests"
          element={
            <ProtectedRoute role="lawyer">
              <LawyerRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lawyer/case-review/:caseId"
          element={
            <ProtectedRoute role="lawyer">
              <CaseReview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lawyer/risk-analysis/:caseId"
          element={
            <ProtectedRoute role="lawyer">
              <RiskAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lawyer/cases"
          element={
            <ProtectedRoute role="lawyer">
              <LawyerMyCases />
            </ProtectedRoute>
          }
        />

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;