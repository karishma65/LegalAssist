import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import api from "../../api/axiosInstance";
import LawyerSidebar from "../../components/LawyerSidebar";
import { Menu } from "lucide-react";

export default function LawyerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/case-request/incoming");
      setRequests(res.data || []);
    } catch (err) {
      setNotification({
        type: "error",
        message: "Failed to load consultation requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.post(`/case-request/accept/${requestId}`);
      setNotification({
        type: "success",
        message: "Request accepted. Case created successfully.",
      });
      fetchRequests();
    } catch {
      setNotification({
        type: "error",
        message: "Failed to accept request.",
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/case-request/reject/${requestId}`);
      setNotification({
        type: "success",
        message: "Request rejected successfully.",
      });
      fetchRequests();
    } catch {
      setNotification({
        type: "error",
        message: "Failed to reject request.",
      });
    }
  };

  const urgencyColors = {
    high: "border-l-4 border-red-500",
    medium: "border-l-4 border-orange-500",
    low: "border-l-4 border-blue-500",
  };

  const urgencyBadge = {
    high: "bg-red-100 text-red-700",
    medium: "bg-orange-100 text-orange-700",
    low: "bg-blue-100 text-blue-700",
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
        <main className="px-12 md:px-20 pt-10 pb-12 flex-1 space-y-10">

          {/* Page Title */}
          <div className="flex justify-between items-center">
            <div>
              <h1
                className="text-4xl font-bold"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Incoming Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Review client consultation submissions
              </p>
            </div>

            <button
              onClick={() => navigate("/lawyer/dashboard")}
              className="px-6 py-3 rounded-xl border border-gray-300 font-semibold hover:bg-gray-100 transition"
            >
              ← Dashboard
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-500">
              Loading requests...
            </p>
          )}

          {/* Empty State */}
          {!loading && requests.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm border border-dashed p-16 text-center">
              <h3 className="text-xl font-bold mb-3">
                No consultation requests
              </h3>
              <p className="text-gray-500">
                You're all caught up for now.
              </p>
            </div>
          )}

          {/* Requests */}
          {!loading && requests.length > 0 && (
            <div className="space-y-8">

              {requests.map((req) => (
                <div
                  key={req.request_id}
                  className={`bg-white rounded-3xl shadow-md border border-gray-100 p-8 transition hover:shadow-xl ${urgencyColors[req.urgency]}`}
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-6">

                    <div>
                      <h3
                        className="text-xl font-bold"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                      >
                        Client: {req.client_name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Request ID #{req.request_id.slice(0, 8)}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold ${urgencyBadge[req.urgency]}`}
                    >
                      {req.urgency.toUpperCase()}
                    </span>

                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {req.short_summary}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center border-t pt-6">

                    <span className="text-xs text-gray-400">
                      Submitted on{" "}
                      {new Date(req.created_at).toLocaleDateString("en-IN")}
                    </span>

                    <div className="flex gap-4">

                      <button
                        onClick={() => handleReject(req.request_id)}
                        className="px-6 py-2 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => handleAccept(req.request_id)}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-semibold hover:opacity-90 transition"
                      >
                        Accept & Create Case
                      </button>

                    </div>
                  </div>

                </div>
              ))}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}