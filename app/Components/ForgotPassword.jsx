"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const ForgotPassword = () => {
  const [email, setEmail] = useState(null);
  const [OTP, setOtp] = useState(null);
  const [password, setPassword] = useState(null);
  const [waitForResponse, setWaitForResponse] = useState(false);
  const [uiChange, setUiChange] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [tryAgain , setTryAgain] = useState(false)
  const router = useRouter();
  const validateEmail = (unverifiedEmail) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(unverifiedEmail);
  };

  const handleGetOtp = async () => {
    if (email && validateEmail(email)) {
      setWaitForResponse(true);
      const res = await fetch("/api/auth/forgotpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      setWaitForResponse(false);
      const data = JSON.parse(JSON.stringify(await res.json()));
      if (res.status === 200) {
        setTryAgain(false)
        setUiChange(true);
      } else {
        setErrMsg(data.reason);
      }
    } else {
      setErrMsg("Invalid Email");
    }
  };

  const handleVerifyOtp = async () => {
    if (
      email &&
      validateEmail(email) &&
      password &&
      password.length >= 5 &&
      OTP &&
      OTP.length === 7
    ) {
      setWaitForResponse(true);
      const res = await fetch("/api/auth/forgotpassword/verifyotp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, OTP }),
      });
      setWaitForResponse(false);
      const data = JSON.parse(JSON.stringify(await res.json()));
      if(res.status === 200){
        router.push('/signin')
      }else{
        setTryAgain(data.tryAgain)
        setErrMsg(data.reason)

      }
    } else {
      setErrMsg("Invalid Credentials");
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-6">Forgot Password</h2>
      {!uiChange && (
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
          <button
            onClick={() => {
              !waitForResponse && handleGetOtp();
            }}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            {waitForResponse ? `Loading...` : `Get OTP`}
          </button>
          <div className="flex justify-between">
            <Link className="flex mt-3 font-bold " href="/signup">
              Create Account
            </Link>
            <Link className="flex mt-3 font-bold " href="/signin">
              Sign in
            </Link>
          </div>
          <span className="text-red-600 font-bold">{errMsg}</span>
        </div>
      )}
      {uiChange && (
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
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-2"
            >
              New Password
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
              !waitForResponse && handleVerifyOtp();
            }}
            className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
          >
            {waitForResponse ? `Loading...` : `Verify`}
          </button>
          {tryAgain && <button
              onClick={() => {setUiChange(false);setErrMsg(false);}}
              className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Try Again
            </button>}
          <span className="text-red-600 font-bold">{errMsg}</span>
        </div>
      )}
    </>
  );
};
