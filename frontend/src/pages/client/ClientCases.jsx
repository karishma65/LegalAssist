import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

/**
 * Decide where to resume the case based on stage
 */
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

/**
 * Stage badge styling
 */
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

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const res = await api.get("/cases/client/my");
      setCases(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async (caseId) => {
    try {
      const res = await api.get(`/cases/${caseId}`);
      const stage = res.data.stage;

      if (stage === "WAITING_LAWYER") {
        alert("Your case is under lawyer review. Please wait.");
        return;
      }

      navigate(getRouteFromStage(stage, caseId));
    } catch (err) {
      console.error(err);
      alert("Continue failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f8] font-['Playfair_Display'] text-[#161117]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#d38be5] px-6 md:px-10 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Legal Assist</h2>
        <button
          onClick={() => navigate("/logout")}
          className="px-5 py-2 bg-white rounded-full font-semibold"
        >
          Logout
        </button>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">My Cases</h1>
          <p className="text-[#7e6487] text-lg">
            Cases accepted by lawyers and currently in progress
          </p>
        </div>

        {loading && (
          <p className="text-center text-gray-500">Loading cases...</p>
        )}

        {!loading && cases.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed p-12 text-center">
            <h3 className="text-xl font-bold mb-2">
              You have no active cases yet
            </h3>
            <p className="text-[#7e6487]">
              Cases will appear here once a lawyer accepts your request.
            </p>
          </div>
        )}

        {!loading && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.case_id}
                className="bg-white rounded-xl p-6 border shadow-sm flex flex-col"
              >
                {/* STATUS */}
                <span
                  className={`inline-block mb-2 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                    c.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {c.status}
                </span>

                {/* STAGE BADGE */}
                <span
                  className={`inline-block mb-3 px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStageBadge(
                    c.stage
                  )}`}
                >
                  {c.stage.replace("_", " ")}
                </span>

                <h3 className="text-lg font-bold mb-1">
                  Case #{c.case_id.slice(0, 8)}
                </h3>

                <p className="text-xs text-gray-500 mb-6">
                  Created on{" "}
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </p>

                <button
                  onClick={() => handleContinue(c.case_id)}
                  disabled={c.stage === "WAITING_LAWYER"}
                  className={`mt-auto py-2 rounded-lg font-bold ${
                    c.stage === "WAITING_LAWYER"
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#d38be5] hover:opacity-90"
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
  );
}