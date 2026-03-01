import { useNavigate } from "react-router-dom";

export default function ClientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen flex flex-col font-['Playfair_Display'] text-[#1e0b24]">
      
      {/* Header */}
      <header className="bg-[#d37be9] sticky top-0 z-50 px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-black">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight font-['Playfair_Display']">
              Legal Assist
            </h2>
          </div>

          {/* Right */}
          <div className="flex items-center gap-6">
            <span className="text-lg hidden md:block">
              Logged in as: <strong>Client</strong>
            </span>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="bg-[#d9c5df] hover:bg-[#98839e] text-black px-6 py-2 rounded-full text-base font-bold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-7xl flex flex-col gap-10">

          {/* Title */}
          <div>
            <h1 className="text-5xl font-bold font-['Playfair_Display']">
              Client Dashboard
            </h1>
            <p className="text-xl italic text-[#6b5b73]">
              Welcome back. Select an action to proceed.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Request Lawyer */}
            <DashboardCard
              title="Request a Lawyer"
              desc="Send a consultation request to a lawyer of your choice."
              primary
              buttonText="Request Lawyer"
              onClick={() => navigate("/client/select-lawyer")}
            />

            {/* My Requests */}
            <DashboardCard
              title="My Requests"
              desc="View the status of lawyer consultation requests."
              buttonText="My Requests"
              onClick={() => navigate("/client/requests")}
            />

            {/* My Cases */}
            <DashboardCard
              title="My Cases"
              desc="View and manage cases accepted by lawyers."
              buttonText="My Cases"
              onClick={() => navigate("/client/cases")}
            />

          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- CARD COMPONENT ---------------- */

function DashboardCard({ title, desc, buttonText, primary, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-[#e2b4f6] rounded-[2rem] p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[380px] hover:-translate-y-1 cursor-pointer font-['Playfair_Display']"
    >
      <div>
        <h3 className="text-3xl font-bold mb-3">
          {title}
        </h3>
        <p className="text-lg text-[#2f1e35] leading-relaxed">
          {desc}
        </p>
      </div>

      <button
        className={`w-full mt-8 py-4 px-6 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition ${
          primary
            ? "bg-[#f3f0f3] text-black hover:bg-[#f9f6f6]"
            : "bg-white text-[#1e0b24] hover:bg-[#f3f3f3]"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}
