import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function LawyerDashboard() {
  const navigate = useNavigate();

  const [lawyerName, setLawyerName] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1️⃣ Logged-in lawyer info
        const meRes = await api.get("/auth/me");
        setLawyerName(meRes.data.username);

        // 2️⃣ Incoming consultation requests
        const reqRes = await api.get("/case-request/incoming");
        setIncomingRequests(reqRes.data || []);

        // 3️⃣ Lawyer's cases
        const caseRes = await api.get("/cases/my");
        setCases(caseRes.data || []);
      } catch (err) {
        console.error("Lawyer dashboard error:", err);
        alert(
          err.response?.data?.detail ||
          "Failed to load lawyer dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Playfair_Display'] text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f8] font-['Playfair_Display'] text-[#161217]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold">Legal Assist</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#7e6685] hidden md:block">
              Logged in as <strong>{lawyerName}</strong>
            </span>
            <button
              onClick={() => navigate("/logout")}
              className="px-5 py-2 bg-[#d38be5] rounded-lg font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex flex-col gap-10">

        {/* TITLE */}
        <div>
          <h1 className="text-4xl font-black">Lawyer Dashboard</h1>
          <p className="text-lg text-[#7e6685]">
            Welcome back, {lawyerName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* INCOMING REQUESTS */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h3 className="text-xl font-bold">Incoming Requests</h3>
                <p className="text-sm text-[#7e6685]">
                  Review new client requests
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                {incomingRequests.length} Pending
              </span>
            </div>

            <div className="divide-y">
              {incomingRequests.map((req) => (
                <div
                  key={req.request_id}
                  onClick={() =>
                    navigate("/lawyer/requests", {
                      state: { requestId: req.request_id },
                    })
                  }
                  className="px-6 py-4 hover:bg-[#faf8fb] cursor-pointer flex justify-between"
                >
                  <div>
                    <p className="font-bold">Client</p>
                    <p className="text-sm text-[#7e6685] truncate max-w-[240px]">
                      {req.short_summary}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      req.urgency === "high"
                        ? "bg-red-100 text-red-700"
                        : req.urgency === "medium"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {req.urgency.toUpperCase()}
                  </span>
                </div>
              ))}

              {incomingRequests.length === 0 && (
                <p className="p-6 text-sm text-gray-500">
                  No incoming requests
                </p>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => navigate("/lawyer/requests")}
                className="w-full py-2 border rounded-lg font-bold hover:bg-[#f5e9fa]"
              >
                View All Requests →
              </button>
            </div>
          </div>

          {/* MY CASES */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-6 border-b flex justify-between">
              <div>
                <h3 className="text-xl font-bold">My Cases</h3>
                <p className="text-sm text-[#7e6685]">
                  Active legal matters
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{cases.length}</p>
                <p className="text-xs text-[#7e6685] font-bold">ACTIVE</p>
              </div>
            </div>

            <div className="divide-y">
              {cases.map((c) => (
                <div
                  key={c.case_id}
                  onClick={() =>
                    navigate(`/lawyer/case-review/${c.case_id}`)
                  }
                  className="px-6 py-4 hover:bg-[#faf8fb] cursor-pointer"
                >
                  <p className="font-bold truncate">
                    Case #{c.case_id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-[#7e6685]">
                    Status: {c.status}
                  </p>
                </div>
              ))}

              {cases.length === 0 && (
                <p className="p-6 text-sm text-gray-500">
                  No active cases
                </p>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => navigate("/lawyer/cases")}
                className="w-full py-2 bg-[#d38be5] rounded-lg font-bold"
              >
                Open My Cases
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
