import {
  LayoutDashboard,
  Inbox,
  Folder,
  LogOut,
  X
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

export default function LawyerSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/lawyer/dashboard" },
    { name: "Incoming Requests", icon: Inbox, path: "/lawyer/requests" },
    { name: "My Cases", icon: Folder, path: "/lawyer/cases" },
  ];

  return (
    <div
      className={`transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="h-full min-h-screen bg-[#EAF3FD] border-r border-[#DCE7F5] flex flex-col justify-between p-6">

        {/* HEADER */}
        <div>
          <div className="flex items-center justify-between mb-10">
            <h2
              className="text-2xl font-bold text-[#0F172A]"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              LegalAssist
            </h2>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-white/70 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* MENU */}
          <div className="space-y-3">
            {menu.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-semibold shadow-md"
                      : "text-[#0F172A] hover:bg-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#14B8A6] text-white font-semibold hover:opacity-90 transition"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </div>
  );
}