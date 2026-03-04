import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import ClientProgressBar from "../../components/ClientProgressBar";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";

export default function RiskAnalysis() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const userRole = localStorage.getItem("role");

  // Auto hide popup
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch risk
  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const res = await api.get(`/analysis/risk/${caseId}`);
        const riskData = res.data?.risk_report || res.data || null;
        setRisk(riskData);
      } catch (err) {
        setNotification({
          type: "error",
          message:
            err.response?.status === 404
              ? "Risk analysis not generated yet."
              : "Failed to load risk analysis.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRisk();
  }, [caseId]);

  // ✅ Correct PDF Download Function
  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(
        `/report/generate/${caseId}`,
        {
          responseType: "blob",
          headers: {
            Accept: "application/pdf",
          },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Case_Report_${caseId}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Download error:", err);

      setNotification({
        type: "error",
        message:
          err.response?.data?.detail ||
          err.message ||
          "Failed to generate PDF.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F8FE] font-['Playfair_Display']">
        Loading risk analysis…
      </div>
    );
  }

  if (!risk || typeof risk !== "object") {
    return (
      <div className="min-h-screen bg-[#F2F8FE] flex items-center justify-center font-['Playfair_Display']">
        No risk data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F8FE] text-[#0F172A]">
      <AppHeader role={userRole === "lawyer" ? "Lawyer" : "Client"} />

      {notification && (
        <CenterPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {userRole === "client" && (
        <ClientProgressBar currentStep={5} />
      )}

      <main className="max-w-[1700px] mx-auto px-12 py-16 space-y-20">

        <div className="text-center max-w-4xl mx-auto">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Risk & Gap Analysis
          </h1>
          <p className="text-gray-600 mt-6 text-lg leading-relaxed">
            AI-identified structural weaknesses, evidentiary gaps,
            and strategic vulnerabilities within the case.
          </p>
        </div>

        <ModernRiskSection
          title="Weak Claims"
          items={risk.weak_claims}
          color="yellow"
        />

        <ModernRiskSection
          title="Loopholes & Missing Evidence"
          items={risk.loopholes}
          color="red"
        />

        <ModernRiskSection
          title="Contradictions"
          items={risk.contradictions}
          color="orange"
        />

        <ModernRiskSection
          title="Possible Opponent Challenges"
          items={risk.possible_opponent_challenges}
          color="purple"
        />

        <ModernRiskSection
          title="Jurisdiction & Limitation Risks"
          items={risk.jurisdiction_or_limitation_risks}
          color="blue"
        />

        <div className="flex justify-between items-center pt-10 border-t border-gray-200">
          <button
            onClick={() =>
              userRole === "lawyer"
                ? navigate("/lawyer/cases")
                : navigate("/client/cases")
            }
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-semibold shadow-md hover:scale-105 transition duration-300"
          >
            Back
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-14 py-4 rounded-2xl bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
          >
            Download PDF
          </button>
        </div>

      </main>
    </div>
  );
}

function ModernRiskSection({ title, items, color }) {
  const hasItems = Array.isArray(items) && items.length > 0;

  const colorMap = {
    yellow: "border-yellow-400 bg-yellow-50",
    red: "border-red-400 bg-red-50",
    orange: "border-orange-400 bg-orange-50",
    purple: "border-purple-400 bg-purple-50",
    blue: "border-blue-400 bg-blue-50",
  };

  return (
    <section className="bg-white rounded-3xl shadow-lg border border-gray-200 p-14">
      <div className="flex items-center mb-12">
        <div className={`w-2 h-10 rounded-full ${colorMap[color].split(" ")[0]}`} />
        <h2
          className="ml-5 text-3xl font-bold"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {title}
        </h2>
      </div>

      {hasItems ? (
        <div className="space-y-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`relative border-l-4 ${
                colorMap[color].split(" ")[0]
              } ${colorMap[color].split(" ")[1]} rounded-2xl p-8 shadow-sm`}
            >
              <div className="absolute -left-6 top-8 w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-sm font-semibold shadow-sm">
                {idx + 1}
              </div>

              <p className="text-gray-700 leading-relaxed ml-8 text-lg">
                {item}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-sm italic">
          No issues identified.
        </div>
      )}
    </section>
  );
}