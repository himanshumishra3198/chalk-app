import { useEffect, useState } from "react";
import { BACKEND_URL } from "../app/configs";
import axios from "axios";

export function useRoomUsers(roomId: string) {
  let [loading, setLoading] = useState(true);
  let [users, setUsers] = useState([]);
  let [error, setError] = useState<string | null>(null);
  async function getUsers() {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${BACKEND_URL}/roomUsers/${roomId}`, {
      headers: {
        Authorization: token,
      },
    });
    if (response.status === 200) {
      setUsers(response.data.users);
      setLoading(false);
    } else {
      setError(response.data);
    }
  }
  useEffect(() => {
    getUsers();
  }, []);

  return { loading, users, error };
}
