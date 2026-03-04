import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import ClientSidebar from "../../components/ClientSidebar";
import { Menu } from "lucide-react";

export default function ClientRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get("/case-request/my");
        setRequests(res.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          setNotification({
            type: "error",
            message: "Session expired. Please login again.",
          });
          setTimeout(() => navigate("/login"), 1200);
        } else {
          setNotification({
            type: "error",
            message:
              err.response?.data?.detail ||
              "Failed to load consultation requests",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);

  const urgencyStyles = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-orange-100 text-orange-700",
    high: "bg-red-100 text-red-700",
  };

  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-[#F2F8FE] text-[#0F172A]">

      {/* SIDEBAR */}
      <ClientSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col transition-all duration-300">

        {/* HEADER */}
        <div className="flex items-center bg-gradient-to-r from-[#2563EB] to-[#14B8A6]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-6 mr-4 p-2 rounded-lg bg-white/20 backdrop-blur hover:bg-white/30 transition"
          >
            <Menu size={22} className="text-white" />
          </button>

          <div className="flex-1">
            <AppHeader role="Client" />
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

        {/* ================= MAIN ================= */}
        <main className="px-12 md:px-20 pt-10 pb-12 flex-1">

          {/* Title Section */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1
                className="text-4xl font-bold mb-3"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                My Consultation Requests
              </h1>
              <p className="text-gray-600 text-lg">
                Track the status of your legal inquiries.
              </p>
            </div>

            <button
              onClick={() => navigate("/client/select-lawyer")}
              className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-bold hover:opacity-90 transition"
            >
              + New Request
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-lg text-gray-500">
              Loading requests...
            </p>
          )}

          {/* Empty State */}
          {!loading && requests.length === 0 && (
            <div className="bg-white rounded-3xl border border-dashed p-16 text-center shadow-sm">
              <h3 className="text-2xl font-bold mb-3">
                No consultation requests yet
              </h3>
              <p className="text-gray-500">
                Start by sending a request to a lawyer.
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && requests.length > 0 && (
            <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">

                  {/* HEADER */}
                  <thead className="bg-[#F8FAFC] border-b">
                    <tr className="text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-4 text-left">Lawyer</th>
                      <th className="px-6 py-4 text-left">Summary</th>
                      <th className="px-6 py-4 text-center">Urgency</th>
                      <th className="px-6 py-4 text-center">Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>

                  {/* BODY */}
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr
                        key={req.request_id}
                        className="hover:bg-[#F4F8FF] transition duration-200"
                      >
                        <td className="px-6 py-5 font-semibold">
                          {req.lawyer_name || "—"}
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600 max-w-[320px]">
                          {req.short_summary}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              urgencyStyles[req.urgency] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {req.urgency?.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-gray-600 text-center">
                          {formatDate(req.created_at)}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusStyles[req.status]
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}