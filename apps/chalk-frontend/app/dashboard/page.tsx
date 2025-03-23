"use client";
import { PlusCircle, UserPlus } from "lucide-react";
import { Sidebar } from "./component/sidebar";
import { RoomCard } from "@repo/ui/roomCard";
import { ActionButton } from "@repo/ui/actionButton";
import { useEffect, useState } from "react";
import { CreateRoom } from "./component/createRoom";
import { JoinRoom } from "./component/joinRoom";
import { useRooms } from "../../hooks/useRooms";
import axios from "axios";
import { BACKEND_URL } from "../configs";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  // Add other properties of the user object if needed
}

const Index = () => {
  let [createRoomOpen, setCreateRoomOpen] = useState(false);
  let [joinRoomOpen, setJoinRoomOpen] = useState(false);
  let [roomLeft, setRoomLeft] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchUser = async () => {
      const response = await axios.get(BACKEND_URL + "/user", {
        headers: {
          Authorization: token,
        },
      });
      if (response.status === 200) {
        setUser(response.data.user);
      }
    };
    fetchUser();
  }, []);

  let { loading, rooms, error } = useRooms([
    createRoomOpen,
    joinRoomOpen,
    roomLeft,
  ]);

  const router = useRouter();
  const handleCreateRoom = () => {
    setCreateRoomOpen(true);
  };

  const handleJoinRoom = () => {
    console.log(rooms);
    setJoinRoomOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      <CreateRoom
        open={createRoomOpen}
        onClose={() => {
          setCreateRoomOpen(false);
        }}
      />
      <JoinRoom
        open={joinRoomOpen}
        onClose={() => {
          setJoinRoomOpen(false);
        }}
      />
      <div className="fixed">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                Welcome{" "}
                {user && user.name.charAt(0).toUpperCase() + user.name.slice(1)}
                !
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your rooms and connections
              </p>
            </div>

            <div className="flex space-x-4">
              <ActionButton
                icon={UserPlus}
                label="Join Room"
                onClick={handleJoinRoom}
                variant="secondary"
              />
              <ActionButton
                icon={PlusCircle}
                label="Create Room"
                onClick={handleCreateRoom}
              />
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Your Rooms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading &&
                rooms.map(
                  (room: {
                    id: string;
                    slug: string;
                    _count: { joinedUsers: number };
                    description: string;
                  }) => (
                    <div key={room.id}>
                      <RoomCard
                        onOpenRoom={() => {
                          return router.push(`/dashboard/room/${room.slug}`);
                        }}
                        slug={room.slug}
                        memberCount={room._count.joinedUsers}
                        description={room.description}
                        onLeaveRoom={async () => {
                          const token = localStorage.getItem("token");
                          console.log(token);
                          await axios.post(
                            BACKEND_URL + `/leaveRoom/${room.id}`,
                            {},
                            {
                              headers: {
                                Authorization: token,
                              },
                            }
                          );
                          setRoomLeft((prev) => !prev);
                        }}
                      />
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
