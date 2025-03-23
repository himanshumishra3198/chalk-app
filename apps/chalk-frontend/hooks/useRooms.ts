import { useEffect, useState } from "react";
import { BACKEND_URL } from "../app/configs";
import axios from "axios";

export function useRooms(dependency: boolean[]) {
  let [loading, setLoading] = useState(true);
  let [rooms, setRooms] = useState([]);
  let [error, setError] = useState<string | null>(null);
  async function getRooms() {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const response = await axios.get(BACKEND_URL + "/rooms", {
      headers: {
        Authorization: token,
      },
    });
    if (response.status === 200) {
      setRooms(response.data.rooms);
      setLoading(false);
    } else {
      setError(response.data);
    }
  }
  useEffect(() => {
    getRooms();
  }, [...dependency]);

  return { loading, rooms, error };
}
