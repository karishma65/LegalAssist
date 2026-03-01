import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import ClientProgressBar from "../../components/ClientProgressBar";

export default function RiskAnalysis() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = localStorage.getItem("role"); // client or lawyer

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await api.get(`/analysis/risk/${caseId}`);
        setRisk(res.data.risk_report);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 404) {
          setError("Risk analysis not generated yet.");
        } else {
          setError("Failed to load risk analysis.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [caseId]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.post(
        `/report/generate/${caseId}`,
        {},
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(res.data);
      window.open(url);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading risk analysis…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">{error}</p>
        <button
          onClick={() =>
            userRole === "lawyer"
              ? navigate("/lawyer/cases")
              : navigate("/client/cases")
          }
          className="px-6 py-2 bg-gray-200 rounded-lg"
        >
          Back
        </button>
      </div>
    );
  }

  if (!risk) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-[#FAFAFA] text-[#161117]"
      style={{ fontFamily: '"Playfair Display", serif' }}
    >
      {/* Header */}
      <header className="border-b bg-white px-10 py-3 flex justify-between">
        <h2 className="text-lg font-bold">LegalAI</h2>
      </header>

      {/* Progress only for client */}
      {userRole === "client" && (
        <ClientProgressBar currentStep={5} />
      )}

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Risk & Gap Analysis</h1>
        <p className="text-[#7e6487] mb-8">
          AI-identified risks, gaps, and weaknesses in this case.
        </p>

        <RiskSection title="Loopholes" items={risk.loopholes} />
        <RiskSection title="Contradictions" items={risk.contradictions} />
        <RiskSection title="Weak Claims" items={risk.weak_claims} />
        <RiskSection
          title="Opponent Challenges"
          items={risk.possible_opponent_challenges}
        />
        <RiskSection
          title="Jurisdiction / Limitation Risks"
          items={risk.jurisdiction_or_limitation_risks}
        />

        {/* Actions */}
        <div className="flex justify-between mt-10 border-t pt-6">
          <button
            onClick={() =>
              userRole === "lawyer"
                ? navigate("/lawyer/cases")
                : navigate("/client/cases")
            }
            className="text-sm font-bold text-[#7e6487]"
          >
            ← Back
          </button>

          {/* Only allow PDF if risk exists */}
          <button
            onClick={handleDownloadPDF}
            className="px-8 py-3 rounded-lg bg-[#D78FEE] font-bold hover:opacity-90"
          >
            Download PDF →
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================
   Reusable Section Component
   ========================= */
function RiskSection({ title, items }) {
  return (
    <section className="mb-8 bg-white rounded-xl border shadow-sm">
      <div className="px-6 py-4 border-b bg-gray-50 font-bold">
        {title}
      </div>
      <div className="p-6 text-sm text-gray-700 space-y-3">
        {items && items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <span>•</span>
              <p>{item}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No issues identified.</p>
        )}
      </div>
    </section>
  );
}