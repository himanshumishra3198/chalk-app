"use client";

import { useState } from "react";
import { Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface User {
  name: string;
  online: boolean;
  id: string;
}

interface ConnectedUsersProps {
  users: User[];
}

export function ConnectedUsers({ users }: ConnectedUsersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get vibrant color based on user id for dark theme
  const getAvatarColor = (id: string) => {
    const colors = [
      "bg-red-900 text-red-200",
      "bg-blue-900 text-blue-200",
      "bg-green-900 text-green-200",
      "bg-yellow-900 text-yellow-200",
      "bg-purple-900 text-purple-200",
      "bg-pink-900 text-pink-200",
      "bg-indigo-900 text-indigo-200",
    ];

    // Use the first character of the id to determine the color
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-2 w-64 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg shadow-black/30"
          >
            <div className="flex items-center justify-between border-b border-zinc-700 p-3">
              <h3 className="font-medium text-zinc-200">Connected Users</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {users.map((user) => (
                <li key={user.id}>
                  <div className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-zinc-800">
                    <div className="relative">
                      <Avatar
                        className={cn("h-9 w-9", getAvatarColor(user.id))}
                      >
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={cn(
                          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-900",
                          user.online ? "bg-green-500" : "bg-zinc-500"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">
                        {user.name}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          user.online ? "text-green-400" : "text-zinc-500"
                        )}
                      >
                        {user.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-700 p-2 text-center text-xs text-zinc-500">
              {users.filter((user) => user.online).length} of {users.length}{" "}
              users online
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg shadow-black/30 transition-all",
          isOpen
            ? "bg-zinc-700 hover:bg-zinc-600"
            : "bg-indigo-700 hover:bg-indigo-600"
        )}
      >
        <Users className="h-5 w-5" />
        <span className="sr-only">Toggle users list</span>
        {!isOpen && users.filter((user) => user.online).length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white">
            {users.filter((user) => user.online).length}
          </span>
        )}
      </Button>
    </div>
  );
}
