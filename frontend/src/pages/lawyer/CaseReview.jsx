import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";

export default function CaseReview() {
  const navigate = useNavigate();
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [runningAI, setRunningAI] = useState(false);
  const [error, setError] = useState(null);

  // Fetch full case details
  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await api.get(`/cases/${caseId}`);
        setCaseData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load case details.");
      } finally {
        setLoadingCase(false);
      }
    };

    fetchCase();
  }, [caseId]);

const handleApprove = async () => {
  try {
    setRunningAI(true);
    setError(null);

    // 1️⃣ Generate claims (if not already)
    await api.post(`/analysis/claims/${caseId}`);

    // 2️⃣ Generate risk analysis
    await api.post(`/analysis/risk/${caseId}`);

    // 3️⃣ Navigate to risk page
    navigate(`/lawyer/risk-analysis/${caseId}`);

  } catch (err) {
    console.error(err);
    setError(
      err.response?.data?.detail ||
      "AI analysis failed. Please try again."
    );
  } finally {
    setRunningAI(false);
  }
};

  if (loadingCase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading case details...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Case not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8">
      <h1 className="text-3xl font-bold mb-6">Case Review</h1>

      {error && (
        <div className="mb-4 bg-red-100 text-red-600 p-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border mb-6">
        <h2 className="text-xl font-bold mb-4">Intake Summary</h2>

        <p><strong>Case ID:</strong> {caseData.case_id}</p>
        <p><strong>Client:</strong> {caseData.client_name}</p>
        <p><strong>Date:</strong> {new Date(caseData.created_at).toLocaleDateString("en-IN")}</p>

        <div className="mt-4">
          <strong>Facts:</strong>
          <p className="mt-2 text-gray-700 whitespace-pre-line">
            {caseData.facts || "No intake submitted yet."}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border mb-6">
        <h2 className="text-xl font-bold mb-4">Claims</h2>

        {caseData.claims?.length > 0 ? (
          caseData.claims.map((c, i) => (
            <div key={i} className="mb-4">
              <p className="font-semibold">{c.claim}</p>
              <p className="text-sm text-gray-600">
                Required Evidence: {c.required_evidence?.join(", ")}
              </p>
            </div>
          ))
        ) : (
          <p>No claims generated yet.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border mb-6">
        <h2 className="text-xl font-bold mb-4">Follow-up Answers</h2>

        {caseData.mock_answers ? (
          <pre className="text-sm whitespace-pre-wrap">
            {caseData.mock_answers}
          </pre>
        ) : (
          <p>No follow-up answers submitted yet.</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleApprove}
          disabled={runningAI}
          className="px-6 py-3 bg-black text-white rounded-lg disabled:opacity-50"
        >
          {runningAI ? "Running AI Analysis..." : "Approve & Continue"}
        </button>
      </div>
    </div>
  );
}