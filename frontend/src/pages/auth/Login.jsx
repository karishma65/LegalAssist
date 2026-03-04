import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData);

      const { access_token, role } = res.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("role", role);

      if (role === "client") {
        navigate("/client/dashboard");
      } else if (role === "lawyer") {
        navigate("/lawyer/dashboard");
      } else {
        setError("Unknown user role");
      }

    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#2563EB] to-[#14B8A6] text-white items-center justify-center">
        <div className="text-center max-w-xl px-8">

          <h1
            className="text-9xl font-bold mb-6 text-white"
            style={{
              fontFamily: '"Playfair Display", serif',
              WebkitTextStroke: "1.5px rgba(255,255,255,0.5)"
            }}
          >
            LegalAssist
          </h1>

          <p className="text-lg opacity-90 leading-relaxed">
            Secure access to your AI-powered legal workspace.
            Manage cases, review evidence, and generate
            structured reports with confidence.
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
            Welcome Back
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Sign in to continue to your dashboard.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

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

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-lg transition duration-200 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to the platform?
            <span
              onClick={() => navigate("/register")}
              className="ml-1 text-[#2563EB] font-semibold cursor-pointer hover:underline"
            >
              Create an account
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}