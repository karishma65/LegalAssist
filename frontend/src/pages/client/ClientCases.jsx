import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import ClientSidebar from "../../components/ClientSidebar";
import { Menu } from "lucide-react";

function getRouteFromStage(stage, caseId) {
  switch (stage) {
    case "INTAKE":
      return `/client/case-intake/${caseId}`;
    case "CLAIMS":
      return `/client/claims/${caseId}`;
    case "EVIDENCE":
      return `/client/evidence/${caseId}`;
    case "FOLLOWUP":
      return `/client/followup/${caseId}`;
    case "RISK_ANALYSIS":
      return `/client/risk/${caseId}`;
    case "PDF_READY":
      return `/client/pdf/${caseId}`;
    default:
      return `/client/cases`;
  }
}

function getStageBadge(stage) {
  switch (stage) {
    case "INTAKE":
      return "bg-blue-100 text-blue-700";
    case "CLAIMS":
      return "bg-purple-100 text-purple-700";
    case "EVIDENCE":
      return "bg-yellow-100 text-yellow-700";
    case "FOLLOWUP":
      return "bg-pink-100 text-pink-700";
    case "WAITING_LAWYER":
      return "bg-orange-100 text-orange-700";
    case "RISK_ANALYSIS":
      return "bg-green-100 text-green-700";
    case "PDF_READY":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function ClientCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto hide popup
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await api.get("/cases/client/my");
      setCases(res.data || []);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to load cases.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (caseId) => {
    try {
      const res = await api.get(`/cases/${caseId}`);
      const stage = res.data.stage;

      if (stage === "WAITING_LAWYER") {
        setNotification({
          type: "error",
          message: "Your case is under lawyer review. Please wait.",
        });
        return;
      }

      navigate(getRouteFromStage(stage, caseId));
    } catch (err) {
      setNotification({
        type: "error",
        message: "Continue failed.",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* SIDEBAR */}
      <ClientSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col transition-all duration-300">

        {/* HEADER */}
        <div className="flex items-center bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-6 mr-4 p-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition"
          >
            <Menu size={22} className="text-white" />
          </button>

          <div className="flex-1">
            <AppHeader role="Client" />
          </div>
        </div>

        {/* CENTER POPUP */}
        {notification && (
          <CenterPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* ================= MAIN ================= */}
        <main className="px-12 md:px-20 pt-10 pb-12 flex-1">

          {/* Title Section */}
          <div className="mb-10">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              My Cases
            </h1>
            <p className="text-gray-600 text-lg">
              Cases accepted by lawyers and currently in progress.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-500">Loading cases...</p>
          )}

          {/* Empty State */}
          {!loading && cases.length === 0 && (
            <div className="bg-white rounded-3xl border border-dashed p-16 text-center shadow-sm">
              <h3 className="text-2xl font-bold mb-3">
                No active cases yet
              </h3>
              <p className="text-gray-500">
                Cases will appear here once a lawyer accepts your request.
              </p>
            </div>
          )}

          {/* Cases Grid */}
          {!loading && cases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {cases.map((c) => (
                <div
                  key={c.case_id}
                  className="bg-white rounded-3xl p-10 border border-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition flex flex-col"
                >
                  <span
                    className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      c.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>

                  <span
                    className={`inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStageBadge(
                      c.stage
                    )}`}
                  >
                    {c.stage.replace("_", " ")}
                  </span>

                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    Case #{c.case_id.slice(0, 8)}
                  </h3>

                  <p className="text-xs text-gray-500 mb-8">
                    Created on{" "}
                    {new Date(c.created_at).toLocaleDateString("en-IN")}
                  </p>

                  <button
                    onClick={() => handleContinue(c.case_id)}
                    disabled={c.stage === "WAITING_LAWYER"}
                    className={`mt-auto py-3 rounded-xl font-bold transition ${
                      c.stage === "WAITING_LAWYER"
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white hover:opacity-90"
                    }`}
                  >
                    {c.stage === "WAITING_LAWYER"
                      ? "Waiting for Lawyer Review"
                      : "Continue Case →"}
                  </button>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}