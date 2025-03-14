"use client";
import { Users, LogOut, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";

interface RoomCardProps {
  slug: string;
  memberCount: number;
  description: string;
  onLeaveRoom?: () => Promise<void>;
  onOpenRoom?: () => void;
}

export const RoomCard = ({
  slug,
  memberCount,
  description,
  onLeaveRoom,
  onOpenRoom,
}: RoomCardProps) => {
  const [open, setOpen] = useState(false);
  const [leave, setLeave] = useState(false);

  const handleLeaveRoom = async () => {
    try {
      if (onLeaveRoom) {
        await onLeaveRoom();
      }
    } catch (error) {
      alert("Failed to leave the room");
    }
  };

  const handleOpenRoom = () => {
    try {
      if (onOpenRoom) {
        onOpenRoom();
      }
    } catch (error) {
      alert("Failed to open the room");
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-200 border border-gray-700  group">
      {/* Title & Description */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-white">{slug}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
      </div>

      {/* Member Count */}
      <div className="flex items-center text-gray-400 pt-4 border-t border-gray-700 mt-4">
        <Users className="w-5 h-5 mr-2" />
        <span className="text-sm">{memberCount} members</span>
      </div>

      {/* Buttons Section */}
      <div className="flex justify-between items-center mt-6 ">
        <Button
          text="Open"
          variant="miniSecondary"
          icon={<ArrowRight className="w-5 h-5" />}
          onClick={() => {
            setOpen(true);
            handleOpenRoom();
          }}
          isLoading={open}
        />
        <Button
          text="Leave"
          variant="danger"
          icon={<LogOut className="w-5 h-5" />}
          onClick={() => {
            setLeave(true);
            handleLeaveRoom();
          }}
          isLoading={leave}
        />
      </div>
    </div>
  );
};
