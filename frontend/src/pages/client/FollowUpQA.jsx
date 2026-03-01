import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ClientProgressBar from "../../components/ClientProgressBar";
import api from "../../api/axiosInstance";

export default function FollowUpQA() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // Fetch follow-up questions
  // =========================
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/followup/questions/${caseId}`);
        setQuestions(res.data.followup_questions || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load follow-up questions");
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

  // =========================
  // Submit answers (FIXED FLOW)
  // =========================
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

      // 1️⃣ Submit answers
      await api.post(`/followup/answers/${caseId}`, payload);

      // 2️⃣ Show confirmation
      alert("Your responses have been submitted. The lawyer will now review your case.");

      // 3️⃣ Redirect to My Cases (NOT risk)
      navigate("/client/cases");

    } catch (err) {
      console.error(err);
      alert("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#F9FAFB]"
      style={{ fontFamily: '"Playfair Display", serif' }}
    >
      <header className="border-b bg-white px-10 py-3 shadow-sm">
        <h2 className="text-xl font-bold">LegalAI</h2>
      </header>

      <ClientProgressBar currentStep={4} />

      <main className="flex justify-center py-10 px-4">
        <div className="w-full max-w-[800px]">

          <h1 className="text-3xl font-bold mb-2">Follow-Up Assessment</h1>
          <p className="text-sm text-gray-600 mb-8">
            Answer the questions below to clarify missing or weak evidence.
          </p>

          {loading && <p>Loading questions…</p>}

          {!loading && questions.length === 0 && (
            <div className="bg-white p-6 rounded-xl border text-center">
              <p>No follow-up questions required.</p>
              <button
                onClick={handleSubmit}
                className="mt-4 px-6 py-2 bg-[#D78FEE] font-bold rounded-lg"
              >
                Continue
              </button>
            </div>
          )}

          {!loading && questions.length > 0 && (
            <div className="bg-white rounded-xl border p-8 space-y-6">
              {questions.map((q, i) => (
                <div key={i}>
                  <label className="font-semibold block mb-1">
                    {i + 1}. {q.question}
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Claim: {q.claim}
                  </p>
                  <textarea
                    className="w-full min-h-[120px] border rounded-lg p-3"
                    value={answers[i] || ""}
                    onChange={(e) =>
                      handleAnswerChange(i, e.target.value)
                    }
                    placeholder="Type your answer here (optional)…"
                  />
                </div>
              ))}

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => navigate(`/client/evidence/${caseId}`)}
                  className="text-sm font-bold text-gray-600"
                >
                  Back
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-[#D78FEE] font-bold rounded-lg"
                >
                  {submitting ? "Submitting..." : "Submit Answers"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}