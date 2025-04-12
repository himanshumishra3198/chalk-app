"use client";
import { Button } from "@repo/ui/button";
import { InputBox } from "@repo/ui/input";
import axios from "axios";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../configs";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin() {
    try {
      if (!(emailRef.current && passwordRef.current)) {
        return;
      }
      const response = await axios.post(BACKEND_URL + "/login", {
        email: emailRef.current.value,
        password: passwordRef.current.value,
      });
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        router.push("/dashboard");
      }
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.error) {
        setError(e.response.data.error || "Something went wrong");
      } else {
        setError("An error occurred");
      }
      console.log(e);
      setTimeout(() => {
        setError("");
      }, 5000);
    }

    setLoading(false);
  }

  return (
    <div className="w-screen flex h-screen items-center justify-center bg-gray-900">
      <div className="border border-gray-700 bg-gray-800 text-gray-200 p-6 rounded shadow-lg">
        <div className="text-gray-100 flex items-center justify-center p-4 font-mono font-extrabold text-2xl">
          Chalk
        </div>
        <div className="flex items-center flex-col gap-4">
          <InputBox reference={emailRef} placeholder="Email" type="text" />
          <InputBox
            reference={passwordRef}
            placeholder="Password"
            type="password"
          />
        </div>
        <div className="text-red-500 text-sm mt-2 flex items-center justify-center font-mono font-extrabold">
          {error}
        </div>
        <div className="text-gray-100 p-4 flex items-center justify-center">
          <Button
            text="Login"
            variant="secondary"
            onClick={() => {
              setLoading(true);
              handleLogin();
            }}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
