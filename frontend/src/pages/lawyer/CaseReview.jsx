import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import LawyerSidebar from "../../components/LawyerSidebar";
import api from "../../api/axiosInstance";
import { Menu } from "lucide-react";

export default function CaseReview() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [runningAI, setRunningAI] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =============================================
  // AUTO HIDE POPUP
  // =============================================
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // =============================================
  // FETCH CASE
  // =============================================
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await api.get(`/cases/${caseId}`);
        setCaseData(res.data);
      } catch (err) {
        setNotification({
          type: "error",
          message: "Failed to load case details.",
        });
      } finally {
        setLoadingCase(false);
      }
    };

    fetchCase();
  }, [caseId]);

  // =============================================
  // SAFE PARSING
  // =============================================
  const parsedClaims = (() => {
    try {
      if (!caseData?.claims) return [];
      return typeof caseData.claims === "string"
        ? JSON.parse(caseData.claims)
        : caseData.claims;
    } catch {
      return [];
    }
  })();

  const parsedAnswers = (() => {
    try {
      if (!caseData?.mock_answers) return [];
      return typeof caseData.mock_answers === "string"
        ? JSON.parse(caseData.mock_answers)
        : caseData.mock_answers;
    } catch {
      return [];
    }
  })();

  // =============================================
  // RUN AI (CLAIMS + RISK)
  // =============================================
  const handleApprove = async () => {
    if (runningAI) return;

    try {
      setRunningAI(true);

      // Always allow regeneration
      await api.post(`/analysis/claims/${caseId}`);
      await api.post(`/analysis/risk/${caseId}`);

      navigate(`/lawyer/risk-analysis/${caseId}`);
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err.response?.data?.detail ||
          "AI analysis failed. Please try again.",
      });
    } finally {
      setRunningAI(false);
    }
  };

  // =============================================
  // LOADING STATES
  // =============================================
  if (loadingCase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F8FE]">
        Loading case details...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F8FE]">
        Case not found.
      </div>
    );
  }

  // =============================================
  // UI
  // =============================================
  return (
    <div className="flex min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* SIDEBAR */}
      <LawyerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="flex items-center bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-6 mr-4 p-2 rounded-md bg-white/20 hover:bg-white/30 transition"
          >
            <Menu size={22} className="text-white" />
          </button>

          <div className="flex-1">
            <AppHeader role="Lawyer" />
          </div>
        </div>

        {/* NOTIFICATION */}
        {notification && (
          <CenterPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full px-16 py-14 space-y-14">

          {/* TITLE */}
          <div>
            <h1 className="text-4xl font-bold">
              Case Review
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Review client submission before running AI analysis.
            </p>
          </div>

          {/* CASE OVERVIEW */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
            <h2 className="text-2xl font-semibold mb-10">
              Case Overview
            </h2>

            <div className="grid md:grid-cols-3 gap-10">

              <InfoCard
                label="Case ID"
                value={`#${caseData.case_id?.slice(0, 8)}`}
                color="text-[#2563EB]"
              />

              <InfoCard
                label="Client Name"
                value={caseData.client_name}
                color="text-[#14B8A6]"
              />

              <InfoCard
                label="Created On"
                value={new Date(caseData.created_at)
                  .toLocaleDateString("en-IN")}
                color="text-indigo-600"
              />

            </div>
          </div>

          {/* INTAKE SUMMARY */}
          <SectionCard title="Intake Summary">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 leading-relaxed text-gray-800 text-lg">
              {caseData.facts || "No intake submitted yet."}
            </div>
          </SectionCard>

          {/* CLAIMS */}
          <SectionCard title="Identified Claims">
            {parsedClaims.length > 0 ? (
              <div className="space-y-8">
                {parsedClaims.map((c, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-8"
                  >
                    <p className="font-semibold text-xl mb-4 text-[#2563EB]">
                      {c.claim}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {c.required_evidence?.map((e, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 text-sm rounded-full bg-white border border-gray-300"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No claims generated yet.</p>
            )}
          </SectionCard>

          {/* FOLLOW UP */}
          <SectionCard title="Follow-Up Answers">
            {parsedAnswers.length > 0 ? (
              <div className="space-y-8">
                {parsedAnswers.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-8"
                  >
                    <p className="text-sm font-semibold text-gray-500 mb-2 uppercase">
                      {item.claim}
                    </p>

                    <p className="font-semibold text-lg mb-3">
                      {item.question}
                    </p>

                    <p className="text-gray-800 text-lg">
                      {item.answer || "No answer provided."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No follow-up answers submitted yet.</p>
            )}
          </SectionCard>

          {/* APPROVE BUTTON */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleApprove}
              disabled={runningAI}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white text-lg font-semibold shadow-xl hover:scale-105 transition disabled:opacity-50"
            >
              {runningAI
                ? "Running AI Analysis..."
                : "Approve & Run AI"}
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}


// =============================================
// REUSABLE COMPONENTS
// =============================================
function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-10">
      <h2 className="text-2xl font-semibold mb-8">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 shadow-sm">
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}