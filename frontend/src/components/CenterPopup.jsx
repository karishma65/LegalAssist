import { useEffect } from "react";

export default function CenterPopup({ notification, setNotification }) {

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div
        className={`w-[420px] p-8 rounded-3xl shadow-2xl bg-white ${
          notification.type === "success"
            ? "border-t-4 border-green-500"
            : "border-t-4 border-red-500"
        }`}
      >
        <h3
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {notification.type === "success" ? "Success" : "Notice"}
        </h3>

        <p className="text-gray-600 mb-6">
          {notification.message}
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => setNotification(null)}
            className={`px-6 py-2 rounded-xl text-white font-semibold ${
              notification.type === "success"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}