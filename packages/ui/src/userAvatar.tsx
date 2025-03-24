import React from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  name?: string;
  online: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar = ({
  name,
  online,
  size = "md",
  className = "",
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: {
      container: "w-10 h-10",
      icon: "w-5 h-5",
      status: "w-2.5 h-2.5 right-0 bottom-0",
      text: "text-xs",
    },
    md: {
      container: "w-14 h-14",
      icon: "w-7 h-7",
      status: "w-3.5 h-3.5 right-0 bottom-0",
      text: "text-sm",
    },
    lg: {
      container: "w-20 h-20",
      icon: "w-10 h-10",
      status: "w-4.5 h-4.5 right-0.5 bottom-0.5",
      text: "text-base",
    },
  };

  return (
    <div className={`flex flex-col items-center space-y-2 group ${className}`}>
      <div className="relative">
        <div
          className={`relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center
            transition-all duration-300 ease-out shadow-lg hover:shadow-xl
            border border-gray-600/30 backdrop-blur-sm
            ${sizeClasses[size].container}`}
        >
          <User
            className={`text-gray-200 transition-transform duration-300 group-hover:scale-110 
              ${sizeClasses[size].icon}`}
          />
        </div>

        <div
          className={`absolute rounded-full border-2 border-gray-800 transition-all duration-300
            ${
              online
                ? "bg-gradient-to-r from-emerald-400 to-emerald-500 animate-pulse"
                : "bg-gray-500"
            }
            ${sizeClasses[size].status}`}
          aria-label={online ? "Online" : "Offline"}
        />
      </div>

      {name && (
        <span
          className={`font-medium transition-all duration-300 ease-out
            text-gray-300 group-hover:text-white
            ${sizeClasses[size].text}`}
        >
          {name}
        </span>
      )}
    </div>
  );
};
