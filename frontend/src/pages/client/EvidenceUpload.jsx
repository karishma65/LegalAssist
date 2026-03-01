import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientProgressBar from "../../components/ClientProgressBar";
import api from "../../api/axiosInstance";

export default function EvidenceUpload() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [filesByClaim, setFilesByClaim] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================
  // Fetch claims for the case
  // =========================
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get(`/case/${caseId}`);
        setClaims(res.data.claims || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load claims");
      }
    };

    fetchClaims();
  }, [caseId]);

  // =========================
  // Handle file selection
  // =========================
  const handleFileChange = (claimName, files) => {
    setFilesByClaim((prev) => ({
      ...prev,
      [claimName]: files,
    }));
  };

  // =========================
  // Upload evidence to backend
  // =========================
  const handleSubmitEvidence = async () => {
    try {
      setLoading(true);

      for (const claim of claims) {
        const selectedFiles = filesByClaim[claim.claim];
        if (!selectedFiles || selectedFiles.length === 0) continue;

        const formData = new FormData();
        formData.append("claim", claim.claim);

        Array.from(selectedFiles).forEach((file) => {
          formData.append("files", file);
        });

        await api.post(`/evidence/upload/${caseId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Move to next step
      navigate(`/client/followup/${caseId}`);

    } catch (error) {
      console.error(error);
      alert("Failed to upload evidence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-white"
      style={{ fontFamily: '"Playfair Display", serif' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b px-10 py-3 bg-white sticky top-0 z-50">
        <h2 className="text-lg font-bold text-[#161117]">LegalAI</h2>
      </header>

      {/* Progress */}
      <ClientProgressBar currentStep={3} />

      {/* Main */}
      <main className="flex flex-1 justify-center py-10 bg-[#fcfbfd]">
        <div className="flex flex-col max-w-[960px] flex-1 px-4 sm:px-8">

          {/* Title */}
          <div className="pb-8 border-b">
            <h1 className="text-[32px] font-bold">Upload Evidence</h1>
            <p className="text-[#7e6487] max-w-2xl">
              Upload files that support each identified claim. Evidence is
              stored claim-wise for lawyer review.
            </p>
          </div>

          {/* Claims */}
          <div className="flex flex-col gap-8 pt-8">
            {claims.map((claim, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border"
              >
                <h3 className="text-xl font-bold mb-2">
                  Claim {index + 1}: {claim.claim}
                </h3>

                {/* Required Evidence */}
                <ul className="list-disc ml-5 text-sm text-[#7e6487] mb-4">
                  {claim.required_evidence?.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>

                {/* File Picker */}
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleFileChange(claim.claim, e.target.files)
                  }
                  className="block w-full text-sm text-[#7e6487]
                             file:mr-4 file:rounded-lg
                             file:border-0 file:px-6 file:h-10
                             file:bg-[#D78FEE] file:text-[#161117]
                             file:font-bold hover:file:bg-[#ce7ce8]"
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-8 mt-4 border-t">
            <button
              onClick={() => navigate(`/client/claims/${caseId}`)}
              className="text-sm font-bold text-[#7e6487]"
            >
              Back to Claims
            </button>

            <button
              onClick={handleSubmitEvidence}
              disabled={loading}
              className="rounded-lg h-11 px-8 bg-[#161117] text-white font-bold disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Submit Evidence"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
