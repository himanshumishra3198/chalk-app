"use client";
import { Button } from "@repo/ui/button";
import { InputBox } from "@repo/ui/input";
import axios from "axios";
import { BACKEND_URL } from "../configs";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  let [loading, setLoading] = useState(false);
  const router = useRouter();
  async function handleSignup() {
    setLoading(true);
    try {
      if (!(nameRef.current && emailRef.current && passwordRef.current)) {
        return;
      }
      const response = await axios.post(BACKEND_URL + "/signup", {
        name: nameRef.current.value,
        email: emailRef.current.value,
        password: passwordRef.current.value,
      });
      if (response.status === 201) {
        router.push("/login");
      } else {
        console.log(response.data);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }
  return (
    <div className="w-screen flex h-screen items-center justify-center">
      <div className="border border-white/10 bg-white/5 text-white p-4 rounded">
        <div className="text-white flex items-center justify-center p-4 font-mono font-extrabold">
          Chalk
        </div>
        <div className="flex items-center flex-col gap-4">
          <InputBox reference={nameRef} placeholder="name" type="text" />
          <InputBox reference={emailRef} placeholder="email" type="text" />
          <InputBox
            reference={passwordRef}
            placeholder="password"
            type="password"
          />
        </div>
        <div className="text-white p-4 flex items-center justify-center">
          <Button
            text="Signup"
            onClick={handleSignup}
            variant="secondary"
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  );
}
