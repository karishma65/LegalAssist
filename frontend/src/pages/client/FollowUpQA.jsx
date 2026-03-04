import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientProgressBar from "../../components/ClientProgressBar";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import api from "../../api/axiosInstance";

export default function FollowUpQA() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Fetch follow-up questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/followup/questions/${caseId}`);
        setQuestions(res.data.followup_questions || []);
      } catch (err) {
        setNotification({
          type: "error",
          message: "Failed to load follow-up questions.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [caseId]);

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const payload = {
        answers: questions.map((q, index) => ({
          claim: q.claim,
          question: q.question,
          answer: answers[index] || "",
        })),
      };

      await api.post(`/followup/answers/${caseId}`, payload);

      setNotification({
        type: "success",
        message:
          "Your responses have been submitted. The lawyer will now review your case.",
      });

      setTimeout(() => {
        navigate("/client/cases");
      }, 1500);

    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to submit answers.",
      });
    } finally {
      setSubmitting(false);
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
      <ClientProgressBar currentStep={4} />

      {/* Main */}
      <main className="flex justify-center px-6 py-14">
        <div className="w-full max-w-4xl space-y-12">

          {/* Heading */}
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Follow-Up Assessment
            </h1>
            <p className="text-gray-600 mt-3 text-lg max-w-3xl">
              Please clarify the following points to strengthen your case.
            </p>
          </div>

          {loading && <p className="text-gray-500">Loading questions…</p>}

          {!loading && questions.length === 0 && (
            <div className="bg-white rounded-3xl shadow-md border border-dashed p-12 text-center">
              <h3 className="text-xl font-bold mb-3">
                No follow-up questions required
              </h3>
              <button
                onClick={handleSubmit}
                className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold hover:opacity-90 transition"
              >
                Continue →
              </button>
            </div>
          )}

          {!loading && questions.length > 0 && (
            <div className="space-y-8">

              {questions.map((q, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition"
                >
                  {/* Question Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold">
                      {i + 1}
                    </div>

                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        {q.question}
                      </h3>

                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#5D90FF]">
                        Claim: {q.claim}
                      </span>
                    </div>
                  </div>

                  {/* Answer Area */}
                  <textarea
                    className="w-full min-h-[140px] rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-[#5D90FF] outline-none"
                    value={answers[i] || ""}
                    onChange={(e) =>
                      handleAnswerChange(i, e.target.value)
                    }
                    placeholder="Type your answer here (optional)…"
                  />
                </div>
              ))}

              {/* Footer */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate(`/client/evidence/${caseId}`)}
                  className="px-6 py-3 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition"
                >
                  ← Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-10 py-3 rounded-xl bg-gradient-to-r from-[#5D90FF] to-[#14B8A6] text-white font-bold hover:opacity-90 transition disabled:opacity-60"
                >
                  {submitting ? "Submitting..." : "Submit Answers →"}
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}