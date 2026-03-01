import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function SelectLawyer() {
  const navigate = useNavigate();

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [search, setSearch] = useState("");

  // 🔹 Fetch lawyers from DB
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const res = await api.get("/users/lawyers");
        setLawyers(res.data);
      } catch {
        alert("Failed to load lawyers");
      }
    };
    fetchLawyers();
  }, []);

  // 🔹 Send consultation request
  const sendRequest = async (lawyerId) => {
    if (!summary.trim()) {
      alert("Please enter a short case summary");
      return;
    }

    try {
      setLoading(true);
      await api.post("/case-request/send", {
        lawyer_id: lawyerId,
        short_summary: summary,
        urgency,
      });
      alert("Consultation request sent");
      navigate("/client/requests");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to send request";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter((l) =>
    l.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fbf8fb] font-['Playfair_Display'] text-[#170e1a]">

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#9107b4] bg-[#d38be5]/95 backdrop-blur-md px-6 py-4 lg:px-12">
        <div className="flex items-center gap-6">
          <h2
            onClick={() => navigate("/client/dashboard")}
            className="text-xl font-bold tracking-tight cursor-pointer"
          >
            Legal Assist
          </h2>

          {/* ✅ NAV LINK ADDED */}
          <button
            onClick={() => navigate("/client/requests")}
            className="text-sm font-bold text-[#170e1a] hover:text-[#9107b4] transition"
          >
            My Requests
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 py-8 md:px-12 lg:px-40 lg:py-12">
        <div className="mx-auto flex max-w-[960px] flex-col gap-10">

          {/* Page Heading */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-5xl font-black">
              Choose a Lawyer
            </h1>
            <p className="text-lg text-[#6b4c75] max-w-2xl">
              Browse our curated network of verified legal professionals.
            </p>
          </div>

          {/* Case Summary */}
          <div className="space-y-4">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter a short summary of your case"
              className="w-full rounded-xl bg-white p-4 shadow-md focus:ring-2 focus:ring-[#d790ee]"
            />

            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="rounded-xl p-3 bg-white shadow-md"
            >
              <option value="low">Low urgency</option>
              <option value="medium">Medium urgency</option>
              <option value="high">High urgency</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lawyer by name"
              className="w-full rounded-xl bg-white py-4 px-4 shadow-md"
            />
          </div>

          {/* Lawyer List */}
          <div className="flex flex-col gap-4">
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer.user_id}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-xl bg-white p-6 shadow-md hover:shadow-lg transition"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#d790ee] transition">
                    {lawyer.username}
                  </h3>
                  <p className="text-sm text-[#6b4c75]">
                    {lawyer.specialization || "General Law"}
                  </p>
                </div>

                <button
                  disabled={loading}
                  onClick={() => sendRequest(lawyer.user_id)}
                  className="min-w-[140px] rounded-xl bg-[#d790ee] hover:bg-[#c670e3] px-6 py-2 text-sm font-bold shadow-md transition disabled:opacity-60"
                >
                  Send Request
                </button>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
