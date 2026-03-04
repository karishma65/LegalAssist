import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import api from "../../api/axiosInstance";
import LawyerSidebar from "../../components/LawyerSidebar";
import { Menu } from "lucide-react";

export default function LawyerDashboard() {
  const navigate = useNavigate();

  const [lawyerName, setLawyerName] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const meRes = await api.get("/auth/me");
        setLawyerName(meRes.data.username);

        const reqRes = await api.get("/case-request/incoming");
        setIncomingRequests(reqRes.data || []);

        const caseRes = await api.get("/cases/my");
        setCases(caseRes.data || []);
      } catch (err) {
        setNotification({
          type: "error",
          message:
            err.response?.data?.detail ||
            "Failed to load lawyer dashboard.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F8FE] text-xl">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F2F8FE] text-[#0F172A]">
      <LawyerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="flex items-center bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-6 mr-4 p-2 rounded-md bg-white/20 hover:bg-white/30 transition"
          >
            <Menu size={22} className="text-white" />
          </button>
          <div className="flex-1">
            <AppHeader role="Lawyer" />
          </div>
        </div>

        {/* POPUP */}
        {notification && (
          <CenterPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* MAIN */}
        <main className="flex-1 px-10 py-10 space-y-12 max-w-6xl mx-auto w-full">

          {/* HERO STRIP */}
          <div className="relative bg-white rounded-2xl border border-gray-200 shadow-md px-8 py-7 flex justify-between items-center overflow-hidden group hover:shadow-xl transition duration-300">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

            <div className="relative">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Welcome, {lawyerName}
              </h1>
              <p className="text-gray-500 mt-1">
                Here’s a quick overview of your activity
              </p>
            </div>

            <div className="relative text-right">
              <p className="text-sm text-gray-400">Total Active</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#2563EB] to-[#14B8A6] bg-clip-text text-transparent">
                {cases.length + incomingRequests.length}
              </p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-2 gap-8">

            {/* Pending */}
            <div className="group relative bg-white rounded-2xl p-7 border border-gray-200 shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

              <div className="relative flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm tracking-wide">
                    Pending Requests
                  </p>
                  <p className="text-4xl font-bold text-[#2563EB] mt-2">
                    {incomingRequests.length}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/lawyer/requests")}
                  className="px-5 py-2 text-sm font-semibold rounded-full bg-[#2563EB] text-[#f7f9fb] hover:bg-[#2563EB] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  View
                </button>
              </div>
            </div>

            {/* Active Cases */}
            <div className="group relative bg-white rounded-2xl p-7 border border-gray-200 shadow-md hover:shadow-xl transition duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

              <div className="relative flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm tracking-wide">
                    Active Cases
                  </p>
                  <p className="text-4xl font-bold text-[#14B8A6] mt-2">
                    {cases.length}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/lawyer/cases")}
                  className="px-5 py-2 text-sm font-semibold rounded-full bg-[#14B8A6] text-[#f2f7f6] hover:bg-[#14B8A6] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Open
                </button>
              </div>
            </div>

          </div>

          {/* INCOMING REQUESTS */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition duration-300">

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">
                Recent Incoming Requests
              </h2>

              <button
                onClick={() => navigate("/lawyer/requests")}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white shadow-md hover:scale-105 hover:shadow-lg transition duration-300"
              >
                View All
              </button>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="p-6 text-gray-500 text-sm">
                No incoming requests
              </div>
            ) : (
              incomingRequests.slice(0, 3).map((req) => (
                <div
                  key={req.request_id}
                  onClick={() =>
                    navigate("/lawyer/requests", {
                      state: { requestId: req.request_id },
                    })
                  }
                  className="px-6 py-5 border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent cursor-pointer transition duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Client Consultation
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-md">
                        {req.short_summary}
                      </p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        req.urgency === "high"
                          ? "bg-red-100 text-red-600"
                          : req.urgency === "medium"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {req.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ACTIVE CASES */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition duration-300">

            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">
                My Active Cases
              </h2>

              <button
                onClick={() => navigate("/lawyer/cases")}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-[#14B8A6] to-[#2563EB] text-white shadow-md hover:scale-105 hover:shadow-lg transition duration-300"
              >
                View All
              </button>
            </div>

            {cases.length === 0 ? (
              <div className="p-6 text-gray-500 text-sm">
                No active cases
              </div>
            ) : (
              cases.slice(0, 3).map((c) => (
                <div
                  key={c.case_id}
                  onClick={() =>
                    navigate(`/lawyer/case-review/${c.case_id}`)
                  }
                  className="px-6 py-5 border-b border-gray-100 hover:bg-gradient-to-r hover:from-teal-50 hover:to-transparent cursor-pointer transition duration-300"
                >
                  <p className="font-medium">
                    Case #{c.case_id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {c.status}
                  </p>
                </div>
              ))
            )}
          </div>

        </main>
      </div>
    </div>
  );
}