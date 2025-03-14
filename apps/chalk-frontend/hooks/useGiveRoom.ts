import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../app/configs";

interface RoomTypes {
  adminId: string;
  createdAt: string;
  description: string;
  id: Number;
  slug: string;
}
export function useGiveRoom(params: Promise<{ slug: string }>) {
  let [loading, setLoading] = useState(true);
  let [room, setRoom] = useState<RoomTypes | null>(null);
  let [error, setError] = useState<string | null>(null);
  async function getRoomWithSlug() {
    const slug = (await params).slug;
    const token = localStorage.getItem("token");
    const response = await axios.get(BACKEND_URL + `/slugToRoom/${slug}`, {
      headers: {
        Authorization: token,
      },
    });
    if (response.status === 200) {
      setRoom(response.data.room);
      console.log(response.data.room);
      setLoading(false);
    } else {
      setError(response.data);
    }
  }

  useEffect(() => {
    getRoomWithSlug();
  }, []);
  return { loading, room, error };
}
