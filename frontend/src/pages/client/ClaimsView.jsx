import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import ClientProgressBar from "../../components/ClientProgressBar";

export default function ClaimsView() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        // ✅ CORRECT API
        const res = await api.get(`/case/${caseId}`);
        console.log("API RESPONSE:", res.data);
        setClaims(res.data.claims || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [caseId]);

  return (
    <div className="min-h-screen bg-[#f7f6f8] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-10 py-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#161117]">Legal Assist</h2>
        <button className="text-sm font-semibold text-gray-600">Logout</button>
      </header>

      {/* Progress */}
      <ClientProgressBar currentStep={2} />

      {/* Main */}
      <main className="flex-1 px-6 py-10 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">

          {/* Heading */}
          <div>
            <h1 className="text-3xl font-bold text-[#161117]">
              Identified Claims
            </h1>
            <p className="text-gray-500 mt-2">
              Based on your case description, the following claims were identified.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <strong>Important:</strong> These claims are automatically generated and
            do not constitute legal advice. A lawyer will review them after evidence submission.
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-gray-500">Loading claims…</p>
          )}

          {/* No Claims */}
          {!loading && claims.length === 0 && (
            <p className="text-gray-500">No claims identified yet.</p>
          )}

          {/* Claims */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {claims.map((c, index) => (
              <div key={index} className="border rounded-xl p-6 bg-white">
                <h3 className="text-xl font-bold text-[#161117]">
                  {c.claim}
                </h3>

                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-600">
                    Required Evidence:
                  </p>
                  <ul className="list-disc ml-5 text-gray-500 text-sm">
                    {c.required_evidence?.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={() => navigate(`/client/case-intake/${caseId}`)}
              className="px-6 py-3 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
            >
              Back to Intake
            </button>

            <button
              onClick={() => navigate(`/client/evidence/${caseId}`)}
              className="px-8 py-3 rounded-lg bg-[#D78FEE] text-[#161117] font-bold hover:bg-[#ce7ce8]">
              Continue to Evidence Upload
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
