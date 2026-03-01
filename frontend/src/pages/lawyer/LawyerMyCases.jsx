import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function LawyerMyCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [lawyerName, setLawyerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const meRes = await api.get("/auth/me");
      setLawyerName(meRes.data.username);

      const casesRes = await api.get("/cases/my");
      setCases(casesRes.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading cases...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f8] font-['Public_Sans'] text-[#161117]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Legal Assist</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7e6487]">
              Logged in as <strong>{lawyerName}</strong>
            </span>
            <button
              onClick={() => navigate("/logout")}
              className="px-4 py-2 bg-[#d790ee] rounded-lg font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-2">My Cases</h1>
          <p className="text-[#7e6487] text-lg">
            Cases you have accepted and are currently handling
          </p>
        </div>

        {/* EMPTY STATE */}
        {cases.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed p-16 text-center">
            <div className="text-4xl mb-4">📂</div>
            <h3 className="text-xl font-bold mb-1">
              You have no active cases yet.
            </h3>
            <p className="text-[#7e6487]">
              Accepted cases will appear here.
            </p>
          </div>
        )}

        {/* CASE LIST */}
        {cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div
                key={c.case_id}
                className="bg-white rounded-xl border shadow-sm p-5 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-[#7e6487]">
                      Case ID
                    </p>
                    <p className="font-bold text-lg">
                      #{c.case_id.slice(0, 8)}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      c.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-sm text-[#7e6487] mb-6">
                  Created on{" "}
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </p>

                <button
                  onClick={() =>
                    navigate(`/lawyer/case-review/${c.case_id}`)
                  }
                  className="mt-auto w-full py-2 rounded-lg bg-[#d790ee] font-bold hover:opacity-90"
                >
                  Open Case →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
