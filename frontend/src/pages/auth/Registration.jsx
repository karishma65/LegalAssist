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

      await api.post("/auth/register", {
        username,
        password,
        role,
      });

      setMessage("✅ Successfully registered! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail || "❌ Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white"
      style={{ fontFamily: '"Playfair Display", serif' }}
    >
      <form
        onSubmit={handleRegister}
        className="w-full max-w-[440px] space-y-6 border p-8 rounded-xl shadow-sm"
      >
        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        {/* Success Message */}
        {message && (
          <p className="text-green-600 text-sm font-semibold text-center">
            {message}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm font-semibold text-center">
            {error}
          </p>
        )}

        <div>
          <label className="text-sm font-semibold">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-[48px] px-4 border rounded-md"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[48px] px-4 border rounded-md"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-[48px] px-4 border rounded-md"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-[48px] px-4 border rounded-md"
          >
            <option value="client">Client</option>
            <option value="lawyer">Lawyer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[50px] bg-[#D78FEE] font-bold rounded-md disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?
          <span
            onClick={() => navigate("/login")}
            className="ml-1 font-semibold cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
