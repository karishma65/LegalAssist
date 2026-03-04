import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import ClientProgressBar from "../../components/ClientProgressBar";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";

export default function ClaimsView() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Auto hide popup
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get(`/case/${caseId}`);
        setClaims(res.data.claims || []);
      } catch (err) {
        console.error(err);
        setNotification({
          type: "error",
          message: "Failed to load claims.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [caseId]);

  return (
    <div className="min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* Global Header */}
      <AppHeader role="Client" />

      {/* Center Popup */}
      {notification && (
        <CenterPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Progress */}
      <ClientProgressBar currentStep={2} />

      {/* Main */}
      <main className="flex-1 px-6 py-14 flex justify-center">
        <div className="w-full max-w-5xl space-y-10">

          {/* Heading */}
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Identified Claims
            </h1>
            <p className="text-gray-600 mt-3 text-lg max-w-3xl">
              Based on your case description, the following potential legal claims
              have been identified.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-5 text-sm text-amber-900 shadow-sm">
            <strong>Important:</strong> These claims are automatically generated
            and do not constitute legal advice. A lawyer will review them after
            evidence submission.
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-gray-500">Loading claims…</p>
          )}

          {/* No Claims */}
          {!loading && claims.length === 0 && (
            <div className="bg-white rounded-3xl shadow-md border border-dashed p-12 text-center">
              <h3 className="text-xl font-bold mb-2">
                No claims identified yet
              </h3>
              <p className="text-gray-500">
                Try updating your intake description for better analysis.
              </p>
            </div>
          )}

          {/* Claims Redesigned */}
          <div className="space-y-8">
            {claims.map((c, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition"
              >
                {/* Claim Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold">
                    {index + 1}
                  </div>

                  <h3
                    className="text-2xl font-bold"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {c.claim}
                  </h3>
                </div>

                {/* Evidence Section */}
                <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Required Evidence:
                  </p>

                  <ul className="space-y-2 text-gray-600 text-sm">
                    {c.required_evidence?.map((e, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#5D90FF] mt-1">•</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-10 border-t border-gray-200">
            <button
              onClick={() => navigate(`/client/case-intake/${caseId}`)}
              className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition"
            >
              ← Back to Intake
            </button>

            <button
              onClick={() => navigate(`/client/evidence/${caseId}`)}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold hover:opacity-90 transition"
            >
              Continue to Evidence →
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}