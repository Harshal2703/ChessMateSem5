"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const SignInComponent = () => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [waitForResponse, setWaitForResponse] = useState(false);
  const router = useRouter();
  const validateEmail = (unverifiedEmail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(unverifiedEmail);
  };
  const signinRequest = async () => {
    if (email && validateEmail(email) && password && password.length >= 5) {
      setWaitForResponse(true);
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      setWaitForResponse(false);
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        router.push("/");
      } else {
        setErrMsg(data.reason);
      }
    } else {
      setErrMsg("Invalid Credential");
    }
  };
  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Sign In</h2>
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-gray-700 text-sm font-medium mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          onChange={(event) => {
            setEmail(event.target.value);
            setErrMsg(null);
          }}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-gray-700 text-sm font-medium mb-2"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
          onChange={(event) => {
            setPassword(event.target.value);
            setErrMsg(null);
          }}
        />
      </div>
      <button
        onClick={() => {
          !waitForResponse && signinRequest();
        }}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        {waitForResponse ? `Loading...` : `Sign In`}
      </button>
      <Link className="flex mt-3 font-bold " href="/signup">
        Create Account
      </Link>
      <span className="text-red-600 font-bold">{errMsg}</span>
    </>
  );
};
