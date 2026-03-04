import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import api from "../../api/axiosInstance";
import LawyerSidebar from "../../components/LawyerSidebar";
import { Menu } from "lucide-react";

export default function LawyerMyCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [lawyerName, setLawyerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-hide popup
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setNotification({
        type: "error",
        message: "Failed to load cases.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F8FE] font-['Playfair_Display'] text-lg font-semibold">
        Loading cases...
      </div>
    );
  }

  const statusStyles = {
    ACTIVE: "border-l-4 border-green-500",
    CLOSED: "border-l-4 border-gray-400",
  };

  const statusBadge = {
    ACTIVE: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* SIDEBAR */}
      <LawyerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col transition-all duration-300">

        {/* HEADER WITH TOGGLE */}
        <div className="flex items-center bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-6 mr-4 p-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition"
          >
            <Menu size={22} className="text-white" />
          </button>

          <div className="flex-1">
            <AppHeader role="Lawyer" />
          </div>
        </div>

        {/* CENTER POPUP */}
        {notification && (
          <CenterPopup
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* MAIN */}
        <main className="px-12 md:px-20 pt-10 pb-12 flex-1 space-y-12">

          {/* Title */}
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              My Cases
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Cases you have accepted and are currently handling
            </p>
          </div>

          {/* Empty State */}
          {cases.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-dashed p-16 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-xl font-bold mb-2">
                No active cases yet
              </h3>
              <p className="text-gray-500">
                Accepted cases will appear here.
              </p>
            </div>
          )}

          {/* Case Grid */}
          {cases.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {cases.map((c) => (
                <div
                  key={c.case_id}
                  className={`bg-white rounded-3xl shadow-md border border-gray-100 p-8 transition hover:shadow-2xl hover:-translate-y-1 flex flex-col ${statusStyles[c.status]}`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">

                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        Case #{c.case_id.slice(0, 8)}
                      </h3>

                      <p className="text-sm text-gray-500 mt-2">
                        Created on{" "}
                        {new Date(c.created_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold ${statusBadge[c.status]}`}
                    >
                      {c.status}
                    </span>

                  </div>

                  {/* Body */}
                  <div className="mb-8">
                    <p className="text-gray-700">
                      Review client submissions, evidence and proceed with analysis.
                    </p>
                  </div>

                  {/* Footer */}
                  <button
                    onClick={() =>
                      navigate(`/lawyer/case-review/${c.case_id}`)
                    }
                    className="mt-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-semibold hover:opacity-90 transition"
                  >
                    Open Case →
                  </button>

                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}