import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData);

      const { access_token, role } = res.data;

      // store auth info
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("role", role);

      // role-based redirect
      if (role === "client") {
        navigate("/client/dashboard");
      } else if (role === "lawyer") {
        navigate("/lawyer/dashboard");
      } else {
        alert("Unknown user role");
      }
    } catch (err) {
      console.error(err);
      alert("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col bg-white overflow-hidden font-['Public_Sans']">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex items-center justify-between px-10 py-6 z-10">
        <div className="flex items-center gap-3 text-[#161117]">
          <div className="size-8 text-[#161117]">
            <svg fill="none" viewBox="0 0 48 48">
              <path
                d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight font-['Playfair_Display']">
            LegalAssist
          </h2>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-[420px] space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold font-['Playfair_Display']">
              Welcome back
            </h2>
            <p className="mt-3 text-[#7e6487]">
              Sign in to your legal workspace
            </p>
          </div>

          {/* LOGIN FORM */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="block w-full rounded-md border py-3 px-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="block w-full rounded-md border py-3 px-4"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-[#D78FEE] py-3.5 font-bold disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-[#7e6487]">
            New to the platform?
            <span
              onClick={() => navigate("/register")}
              className="font-semibold text-[#161117] ml-1 cursor-pointer"
            >
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
