import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function Registration() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!username || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", { username, password, role });

      setMessage("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#2563EB] to-[#14B8A6] text-white items-center justify-center">
        <div className="text-center max-w-lg">
          <h1
        className="text-9xl font-bold mb-6 text-white"
        style={{
          fontFamily: '"Playfair Display", serif',
          textShadow: "0 4px 20px rgba(0,0,0,0.2)",
         }}
      >
            LegalAssist
          </h1>

          <p className="text-lg opacity-90 leading-relaxed">
            Intelligent Legal Case Management Platform powered by AI -
            built to streamline case workflows, evidence tracking,
            and professional legal reporting.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="w-full max-w-xl bg-white p-12 rounded-3xl shadow-2xl border border-gray-100">

          <h2 
            className="text-3xl font-bold text-[#0F172A] mb-2"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Create Account
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Join the platform and manage cases with confidence.
          </p>

          {message && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="client">Client</option>
              <option value="lawyer">Lawyer</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg transition duration-200 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?
            <span
              onClick={() => navigate("/login")}
              className="ml-1 text-[#2563EB] font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}