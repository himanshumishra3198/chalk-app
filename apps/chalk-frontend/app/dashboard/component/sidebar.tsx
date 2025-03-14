"use client";
import { Button } from "@repo/ui/button";
import { HomeIcon, PlusCircleIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const rooms = [
  { id: 1, name: "General", active: true },
  { id: 2, name: "Random", active: false },
  { id: 3, name: "Project Alpha", active: false },
];

export const Sidebar = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  function handleLogout() {
    setLoggingOut(true);
    localStorage.setItem("token", "");
    router.push("/");
  }
  return (
    <div className="hidden md:flex h-screen w-64 flex-col bg-gray-950 text-white border-r border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Rooms Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
          <Button
            variant="secondary"
            text="Logout"
            icon={!loggingOut && <UsersIcon className="w-4 h-4" />}
            isLoading={loggingOut}
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};
