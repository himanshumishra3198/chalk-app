import { Button } from "@repo/ui/button";
import { InputBox } from "@repo/ui/input";
import axios from "axios";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { BACKEND_URL } from "../../configs";
import { CreateRoomSchema } from "@repo/common/config";

export function JoinRoom({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState("");
  const slugRef = useRef<HTMLInputElement>(null);

  async function handleJoinRoom() {
    if (!slugRef.current) return;
    const parsedData = CreateRoomSchema.safeParse({
      slug: slugRef.current.value,
    });
    if (!parsedData.success) {
      console.log(parsedData.error);
      return;
    }
    setDisabled(true);
    try {
      const token = localStorage.getItem("token");
      const received = await axios.get(
        BACKEND_URL + `/slugToRoom/${slugRef.current.value}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (!received.data.room) {
        setError("Room not found");
        setDisabled(false);
        setTimeout(() => {
          setError("");
        }, 5000);
        return;
      }
      const roomId = received.data.room.id;
      const response = await axios.post(
        BACKEND_URL + `/joinRoom/${roomId}`,
        {
          slug: slugRef.current.value,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      if (response.status === 200) {
        console.log(response.data);
        onClose();
      } else {
        console.log(response.data);
        onClose();
      }
    } catch (e) {
      console.log(e);
    }
    setDisabled(false);
  }

  return (
    <div>
      {open && (
        <div
          className={
            "w-screen h-screen fixed flex justify-center items-center bg-slate-500 top-0 left-0 bg-opacity-60"
          }
        >
          <div className="bg-gray-950 p-4 opacity-100 rounded">
            <div className="flex justify-end">
              <div className="cursor-pointer" onClick={onClose}>
                <X className="w-4 h-4" />
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <InputBox type="text" placeholder="slug..." reference={slugRef} />
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-2 flex items-center justify-center font-mono font-extrabold">
                {error}
              </div>
            )}

            <div className="p-4 flex justify-center items-center">
              <Button
                text="Join"
                variant="secondary"
                onClick={handleJoinRoom}
                disabled={disabled}
                isLoading={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
