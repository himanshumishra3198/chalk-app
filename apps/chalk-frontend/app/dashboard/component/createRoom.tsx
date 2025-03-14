"use client";
import { Button } from "@repo/ui/button";
import { InputBox } from "@repo/ui/input";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { BACKEND_URL } from "../../configs";
import { CreateRoomSchema } from "@repo/common/config";

export function CreateRoom({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [disabled, setDisabled] = useState(false);
  const slugRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  async function handleSubmit() {
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
      const response = await axios.post(
        BACKEND_URL + "/room",
        {
          slug: slugRef.current.value,
          description: descriptionRef.current
            ? descriptionRef.current.value
            : null,
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
              <InputBox
                type="text"
                placeholder="description..."
                reference={descriptionRef}
              />
            </div>
            <div className="p-4 flex justify-center items-center">
              <Button
                text="Create"
                // icon={<Plus className="w-4 h" color="white" />}
                variant="secondary"
                onClick={handleSubmit}
                isLoading={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
