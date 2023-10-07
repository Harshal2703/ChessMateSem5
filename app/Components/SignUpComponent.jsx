"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const RegistrationComponent = () => {
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [otp, setOtp] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [veriUI, setVeriUI] = useState(false);
  const router = useRouter();

  const validateEmail = (unverifiedEmail) => {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(unverifiedEmail);
  };
  const verifyCredentials = async () => {
    if (
      email &&
      validateEmail(email) &&
      username &&
      username.length >= 5 &&
      password &&
      password.length >= 5
    ) {
      const res = await fetch("/api/authentication/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        setVeriUI(true);
      } else {
        setErrMsg(data.reason);
      }
    } else {
      setErrMsg("Invalid Credentials");
    }
  };
  const verifyOtp = async () => {
    if (email && validateEmail(email) && otp && otp.length === 7) {
      const res = await fetch("/api/authentication/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password, otp }),
      });
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        localStorage.setItem("ChessMate-Sign-In-Token", data.token);
        router.push("/");
      } else {
        setErrMsg(data.reason);
      }
    }
  };

  return (
    <>
      {!veriUI && (
        <>
          <h2 className="text-2xl font-semibold mb-6">Register</h2>
          <div>
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
                htmlFor="username"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
                onChange={(event) => {
                  setUsername(event.target.value);
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
              onClick={verifyCredentials}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Next
            </button>
      <Link className="mt-3 flex font-bold " href='/signin'>Already have an Account? Sign In</Link>
            <span className="text-red-600 font-bold">{errMsg}</span>
          </div>
        </>
      )}
      {veriUI && (
        <>
          <div className="space-y-3">
            <label
              htmlFor="otp"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
              onChange={(event) => {
                setOtp(event.target.value);
                setErrMsg(null);
              }}
            />
            <button
              onClick={verifyOtp}
              className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Verify
            </button>
            <span className="text-red-600 font-bold">{errMsg}</span>
          </div>
        </>
      )}
    </>
  );
};
