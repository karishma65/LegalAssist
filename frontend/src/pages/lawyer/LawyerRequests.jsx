import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function LawyerRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/case-request/incoming");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load consultation requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.post(`/case-request/accept/${requestId}`);
      fetchRequests(); // refresh list
    } catch {
      alert("Failed to accept request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/case-request/reject/${requestId}`);
      fetchRequests(); // refresh list
    } catch {
      alert("Failed to reject request");
    }
  };

  const urgencyStyles = {
    high: "bg-red-50 text-red-700 border-red-100",
    medium: "bg-orange-50 text-orange-700 border-orange-100",
    low: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div className="min-h-screen bg-[#f8f6f8] px-6 py-10 font-['Playfair_Display'] text-[#161118]">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">
              Incoming Consultation Requests
            </h1>
            <p className="text-sm text-[#816388]">
              Review client case requests before proceeding
            </p>
          </div>

          <button
            onClick={() => navigate("/lawyer/dashboard")}
            className="h-10 px-4 rounded-lg border bg-white hover:bg-[#f3f0f4] text-sm font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-sm text-gray-500">
            Loading requests...
          </p>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed p-12 text-center">
            <h3 className="text-lg font-bold mb-1">
              No consultation requests at the moment
            </h3>
            <p className="text-sm text-[#816388]">
              You’re all caught up.
            </p>
          </div>
        )}

        {/* Requests from DB */}
        {!loading &&
          requests.map((req) => (
            <div
              key={req.request_id}
              className="bg-white rounded-xl p-6 border shadow-sm flex flex-col gap-4"
            >
              {/* Top Row */}
              <div className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                    ID
                  </span>
                  <span className="font-mono font-bold text-sm">
                    #{req.request_id.slice(0, 6)}
                  </span>
                </div>

                <span className="text-xs text-[#816388]">
                  {new Date(req.created_at).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Body */}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${
                    urgencyStyles[req.urgency]
                  }`}
                >
                  {req.urgency.toUpperCase()} URGENCY
                </span>

                <p className="text-sm font-semibold mb-1">
                  Client: {req.client_name}
                </p>

                <p className="text-sm text-[#5d5461] leading-relaxed line-clamp-2">
                  {req.short_summary}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleReject(req.request_id)}
                  className="h-9 px-4 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleAccept(req.request_id)}
                  className="h-9 px-4 rounded-lg bg-[#c330e8] text-white text-sm font-semibold hover:opacity-90"
                >
                  Accept & Create Case
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
