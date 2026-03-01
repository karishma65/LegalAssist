import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientProgressBar from "../../components/ClientProgressBar";
import api from "../../api/axiosInstance";

export default function CaseIntake() {
  const { caseId } = useParams(); // ✅ EXISTING CASE ID
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert("Please describe your case");
      return;
    }

    try {
      setLoading(true);

      // ✅ UPDATE EXISTING CASE (NO NEW CASE CREATION)
      await api.post(`/case/${caseId}/intake`, {
        facts: description,
      });

      // ✅ CONTINUE SEQUENCE
      navigate(`/client/claims/${caseId}`);

    } catch (error) {
      console.error(error);
      alert("Failed to submit case intake");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden"
      style={{ fontFamily: '"Playfair Display", serif' }}
    >
      <div className="flex h-full grow flex-col">

        {/* Header */}
        <header className="flex items-center justify-between bg-white border-b px-10 py-4 shadow-sm">
          <h2 className="text-lg font-bold text-[#161117]">LegalAI</h2>
        </header>

        {/* Progress */}
        <ClientProgressBar currentStep={1} />

        {/* Main */}
        <main className="flex flex-1 justify-center py-10 px-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow border overflow-hidden">
            <div className="p-8 space-y-6">

              <div>
                <h1 className="text-3xl font-bold text-[#161117]">
                  Describe your case
                </h1>
                <p className="text-slate-500 mt-2">
                  Provide a detailed description. This will be used to identify
                  claims and required evidence.
                </p>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[360px] rounded-xl border p-6 text-lg"
                placeholder="Type your case details here..."
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 h-12 rounded-lg bg-[#D78FEE] font-bold"
                >
                  {loading ? "Analyzing..." : "Submit"}
                </button>
              </div>

            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
