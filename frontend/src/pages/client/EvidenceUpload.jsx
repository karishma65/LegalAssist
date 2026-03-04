import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientProgressBar from "../../components/ClientProgressBar";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import api from "../../api/axiosInstance";

export default function EvidenceUpload() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [filesByClaim, setFilesByClaim] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Auto-hide popup
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await api.get(`/case/${caseId}`);
        setClaims(res.data.claims || []);
      } catch (err) {
        setNotification({
          type: "error",
          message: "Failed to load claims.",
        });
      }
    };

    fetchClaims();
  }, [caseId]);

  const handleFileChange = (claimName, files) => {
    setFilesByClaim((prev) => ({
      ...prev,
      [claimName]: files,
    }));
  };

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
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setNotification({
        type: "success",
        message: "Evidence uploaded successfully.",
      });

      setTimeout(() => {
        navigate(`/client/followup/${caseId}`);
      }, 1200);

    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to upload evidence.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* Header */}
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
      <ClientProgressBar currentStep={3} />

      {/* Main */}
      <main className="flex justify-center px-6 py-14">
        <div className="w-full max-w-5xl space-y-12">

          {/* Page Title */}
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Upload Supporting Evidence
            </h1>
            <p className="text-gray-600 mt-3 text-lg max-w-3xl">
              Attach relevant documents, proofs, or records that support each identified claim.
            </p>
          </div>

          {/* Claims Upload Section */}
          <div className="space-y-8">
            {claims.map((claim, index) => {
              const selectedFiles = filesByClaim[claim.claim];

              return (
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
                      {claim.claim}
                    </h3>
                  </div>

                  {/* Required Evidence */}
                  <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-gray-100 mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Suggested Evidence:
                    </p>

                    <ul className="space-y-2 text-gray-600 text-sm">
                      {claim.required_evidence?.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#5D90FF] mt-1">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Upload Area */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-gray-700">
                      Upload Files
                    </label>

                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        handleFileChange(claim.claim, e.target.files)
                      }
                      className="block w-full text-sm
                                 file:mr-4 file:rounded-xl
                                 file:border-0 file:px-6 file:py-2
                                 file:bg-gradient-to-r file:from-[#5D90FF] file:to-[#14B8A6]
                                 file:text-white file:font-semibold
                                 hover:file:opacity-90"
                    />

                    {selectedFiles && (
                      <p className="text-sm text-green-600 font-semibold">
                        {selectedFiles.length} file(s) selected
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between pt-10 border-t border-gray-200">
            <button
              onClick={() => navigate(`/client/claims/${caseId}`)}
              className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition"
            >
              ← Back to Claims
            </button>

            <button
              onClick={handleSubmitEvidence}
              disabled={loading}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Uploading..." : "Submit Evidence →"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}