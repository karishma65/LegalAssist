import { useNavigate } from "react-router-dom";

export default function AppHeader({ role = "Client"}) {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-[#5d90ff] via-[#afcaf6] to-[#14B8A6] shadow-md">

  <div className="px-12 py-6 flex items-center justify-between">

    {/* Logo */}
    <div className="flex flex-col">
      <h2
        className="text-4xl font-bold text-white"
        style={{ fontFamily: '"Playfair Display", serif' }}
      >
           LegalAssist
      </h2>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-6">

      <span className="hidden md:block text-lg text-white/90">
        Logged in as : <strong className="text-white">{role}</strong>
      </span>

      <button
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
        className="px-6 py-2 rounded-xl bg-white text-[#2563EB] font-semibold hover:bg-gray-100 transition"
      >
        Logout
      </button>

    </div>

  </div>
</header>
  );
}