import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import ClientSidebar from "../../components/ClientSidebar";
import { Menu } from "lucide-react";

export default function SelectLawyer() {
  const navigate = useNavigate();

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await api.get("/users/lawyers");
        setLawyers(res.data);
      } catch {
        setNotification({
          type: "error",
          message: "Failed to load lawyers.",
        });
      }
    };
    fetchLawyers();
  }, []);

  const sendRequest = async (lawyerId) => {
    if (!summary.trim()) {
      setNotification({
        type: "error",
        message: "Please enter a short case summary.",
      });
      return;
    }

    try {
      setLoading(true);

      await api.post("/case-request/send", {
        lawyer_id: lawyerId,
        short_summary: summary,
        urgency,
      });

      setNotification({
        type: "success",
        message: "Consultation request sent successfully.",
      });

      setTimeout(() => {
        navigate("/client/requests");
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to send request";

      setNotification({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter((l) =>
    l.username.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* ================= MAIN CONTENT ================= */}
        <main className="px-12 md:px-20 pt-10 pb-12 flex-1 space-y-10">

          {/* Title */}
          <div>
            <h1
              className="text-4xl font-bold mb-3"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Choose a Lawyer
            </h1>

            <p className="text-gray-600 text-lg max-w-3xl">
              Select a verified legal professional and send a consultation request.
            </p>
          </div>

          {/* Case Summary Card */}
          <div className="bg-white rounded-3xl p-10 shadow-md border border-gray-100 space-y-6">
            <h3
              className="text-2xl font-bold"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              Case Summary
            </h3>

            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter a short summary of your case..."
              className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-[#2563EB] outline-none"
              rows={4}
            />

            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-[#2563EB] outline-none"
            >
              <option value="low">Low urgency</option>
              <option value="medium">Medium urgency</option>
              <option value="high">High urgency</option>
            </select>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lawyer by name"
            className="w-full rounded-xl border border-gray-300 py-4 px-4 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white shadow-sm"
          />

          {/* Lawyers List */}
          <div className="flex flex-col gap-6">
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer.user_id}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white rounded-3xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-1 transition border border-gray-100"
              >
                <div>
                  <h3
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {lawyer.username}
                  </h3>

                  <p className="text-gray-600">
                    {lawyer.specialization || "General Law"}
                  </p>
                </div>

                <button
                  disabled={loading}
                  onClick={() => sendRequest(lawyer.user_id)}
                  className="min-w-[200px] py-3 px-8 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                  Send Request
                </button>
              </div>
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}