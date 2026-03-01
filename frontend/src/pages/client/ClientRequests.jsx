import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function ClientRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch logged-in client's requests
useEffect(() => {
  const fetchRequests = async () => {
    try {
      const res = await api.get("/case-request/my");
      setRequests(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/login");
      } else {
        alert(
          err.response?.data?.detail ||
          "Failed to load consultation requests"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  fetchRequests();
}, [navigate]);


  // 🔹 Styles
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
    <div className="min-h-screen bg-[#fbf8fc] px-6 md:px-20 py-10 font-['Playfair_Display'] text-[#180d1b]">

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            My Consultation Requests
          </h1>
          <p className="text-lg italic text-[#5c5461]">
            Track the status of your legal inquiries
          </p>
        </div>

        <button
          onClick={() => navigate("/client/select-lawyer")}
          className="h-12 px-6 rounded-xl bg-[#a411d4] text-white font-bold hover:opacity-90 transition"
        >
          + New Request
        </button>
      </div>

      {/* Filters (UI only) */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select className="h-10 px-4 rounded-lg bg-white border">
          <option>All Status</option>
          <option>Pending</option>
          <option>Accepted</option>
          <option>Rejected</option>
        </select>

        <input
          type="text"
          placeholder="Search by lawyer or subject..."
          className="h-10 px-4 rounded-lg bg-white border w-full md:w-80"
        />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-lg">Loading requests...</p>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <p className="text-center text-lg text-gray-500">
          No consultation requests found.
        </p>
      )}

      {/* Requests Table */}
      {!loading && requests.length > 0 && (
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#faf7fc] border-b">
              <tr className="text-xs uppercase tracking-wider text-[#5c5461]">
                <th className="p-4">Lawyer</th>
                <th className="p-4">Summary</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {requests.map((req) => (
                <tr
                  key={req.request_id}
                  className="hover:bg-[#fcfaff] transition"
                >
                  <td className="p-4 font-bold">
                    {req.lawyer_name || "—"}
                  </td>

                  <td className="p-4 text-sm text-[#5c5461] max-w-[280px] truncate">
                    {req.short_summary}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        urgencyStyles[req.urgency] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {req.urgency?.toUpperCase()}
                    </span>
                  </td>

                  <td className="p-4 text-sm text-[#5c5461]">
                    {formatDate(req.created_at)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        statusStyles[req.status]
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      disabled={req.status !== "ACCEPTED"}
                      className={`font-bold ${
                        req.status === "ACCEPTED"
                          ? "text-[#a411d4] hover:underline"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-center text-gray-400 italic mt-10">
        Protected by Attorney-Client Privilege. All data is encrypted.
      </p>
    </div>
  );
}
