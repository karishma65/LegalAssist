import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import CenterPopup from "../../components/CenterPopup";
import ClientSidebar from "../../components/ClientSidebar";
import { Menu } from "lucide-react";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        <CenterPopup
          notification={notification}
          setNotification={setNotification}
        />

        {/* HERO SECTION */}
        <section className="px-12 md:px-20 pt-10 pb-6">
          <h1
            className="text-4xl font-bold mb-3"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Client Dashboard
          </h1>

          <p className="text-gray-600 text-lg max-w-3xl leading-relaxed">
            Manage your consultations, case requests, and active cases.
            Navigate through your legal workflow with clarity and confidence.
          </p>
        </section>

        {/* ACTION CARDS */}
        <section className="px-12 md:px-20 pb-12 flex-1 flex items-start">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">

            <DashboardCard
              title="Request a Lawyer"
              desc="Send a consultation request to a lawyer of your choice."
              primary
              buttonText="Request Lawyer"
              onClick={() => navigate("/client/select-lawyer")}
            />

            <DashboardCard
              title="My Requests"
              desc="Track the status of consultation requests sent to lawyers."
              buttonText="My Requests"
              onClick={() => navigate("/client/requests")}
            />

            <DashboardCard
              title="My Cases"
              desc="Access and manage cases that have been accepted by lawyers."
              buttonText="My Cases"
              onClick={() => navigate("/client/cases")}
            />

          </div>
        </section>

      </div>
    </div>
  );
}

/* ================= CARD COMPONENT ================= */

function DashboardCard({ title, desc, buttonText, primary, onClick }) {
  return (
    <div className="bg-white rounded-3xl p-10 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col justify-between min-h-[340px]">

      <div>
        <h3
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {title}
        </h3>

        <p className="text-gray-600 leading-relaxed text-base">
          {desc}
        </p>
      </div>

      <button
        onClick={onClick}
        className={`mt-10 w-full py-3 rounded-xl font-semibold transition ${
          primary
            ? "bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white hover:opacity-90"
            : "border-2 border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6] hover:text-white"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}