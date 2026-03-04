import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientProgressBar from "../../components/ClientProgressBar";
import api from "../../api/axiosInstance";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";

export default function CaseIntake() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // ✅ Auto hide popup
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setNotification({
        type: "error",
        message: "Please describe your case before continuing.",
      });
      return;
    }

    try {
      setLoading(true);

      await api.post(`/case/${caseId}/intake`, {
        facts: description,
      });

      navigate(`/client/claims/${caseId}`);
    } catch (error) {
      console.error(error);
      setNotification({
        type: "error",
        message: "Failed to submit case intake.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* ✅ Global Header */}
      <AppHeader role="Client" />

      {/* ✅ Center Popup */}
      {notification && (
        <CenterPopup
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Progress Bar */}
      <ClientProgressBar currentStep={1} />

      {/* Main */}
      <main className="flex justify-center py-14 px-6">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-md border border-gray-100">

          <div className="p-10 space-y-8">

            {/* Title Section */}
            <div>
              <h1
                className="text-4xl font-bold"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Describe Your Case
              </h1>

              <p className="text-gray-600 mt-3 text-lg max-w-3xl">
                Provide a detailed explanation of your situation.
                This information will help identify legal claims and required evidence.
              </p>
            </div>

            {/* Textarea */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[360px] rounded-2xl border border-gray-300 p-6 text-lg focus:ring-2 focus:ring-[#5D90FF] outline-none"
              placeholder="Type your case details here..."
            />

            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 h-14 rounded-xl bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold text-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Continue →"}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}