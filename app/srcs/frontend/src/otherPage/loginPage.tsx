import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../utils";

const Register = ( { verifyRef, onSubmit }: { verifyRef: React.RefObject<VerifyBody>, onSubmit: () => void } ) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    verifyRef.current.username = formData.get("username") as string;
    verifyRef.current.email = formData.get("email") as string;
    verifyRef.current.password = formData.get("password") as string;
    onSubmit();
  };
  return (
    <>
      <form className="flex flex-col items-center justify-center w-full gap-2 mt-5" onSubmit={handleSubmit}>
      <input className="p-0.5 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
        type="text" name="username" placeholder="Enter username" required autoComplete="on"
      />
      <input className="p-0.5 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
        type="email" name="email" placeholder="Enter email address" required autoComplete="email"
      />
      <input className="p-0.5 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
      type="password" name="password" placeholder="Enter password" required autoComplete="current-password"
      />
      <button type="submit" className="border-black-300 border-2 rounded-lg p-1">Register</button>
      </form>
    </>
  );
}
//feat! "return button"

const OTPModal = ({ verifyRef, onVerify }: { verifyRef: React.RefObject<VerifyBody>, onVerify: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="flex flex-col items-center justify-center gap-2 bg-blue-200 rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="items-center text-center font-bold">Enter OTP</h2>
        <input
          type="text" pattern="\d{6}" maxLength={6} required placeholder="6-digit code"
          onChange={(e) => (verifyRef.current.otp = e.target.value)}
          className="border w-2/3 p-1 text-center"/>
        <button className="relative inline-flex items-center justify-center mx-2 p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-2 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          onClick={onVerify}>
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Verify OTP
          </span>
        </button>
      </div>
    </div>
  );
}
//feat have to use certain like onKeyDown to prevent user from type non digit
//feat "dismiss button": user able to submit new OTP to same / diff email

const LoginForm = ({ verifyRef, onSubmit }: { verifyRef: React.RefObject<VerifyBody>, onSubmit: () => void }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    verifyRef.current.email = formData.get("email") as string;
    verifyRef.current.password = formData.get("password") as string;
    onSubmit();
  };
  return (
    <>
      <form className="flex flex-col items-center w-full gap-2 mt-2" onSubmit={handleSubmit}>
      <input className="p-0.5 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
        type="email" name="email" placeholder="Enter email address" required autoComplete="email"
      />
      <input className="p-0.5 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
      type="password" name="password" placeholder="Enter password" required autoComplete="current-password"
      />
      <button type="submit" className="border-black-300 border-2 rounded-lg p-1 mt-2">Sign in</button>
      </form>
    </>
  );
}

type VerifyBody = {
  username?: string;
  email: string;
  password?: string;
  otp: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showOTP, setShowOTP] = useState(false);
  const verifyRef = useRef<VerifyBody>({ email: "", otp: "" });

  useEffect(() => {
    document.title = mode === "login" ? "KLBQ | Login" : "KLBQ | Register";
  }, [mode]);

  const handleRegister = async () => {
    try {
      toast("Connecting to server...");
      const data = await apiFetch("register", { method: "POST", body: JSON.stringify(verifyRef.current) });

      toast.success(data.message);
      if (data.requireOTP)
        setShowOTP(true);

    } catch (err: any) {
      console.error("Issue: " + err.message);
      if (err.message.includes("Failed to fetch"))
        toast.error("Server Error");
      else
        toast.error(err.message);
    }
  }

  const handleLogin = async () => {
    try {
      toast("Submit succesful. Loading...");
      const data = await apiFetch("login", { method: "POST", body: JSON.stringify(verifyRef.current) });

      toast.success(data.message);
      if (data.requireOTP)
        setShowOTP(true);

    } catch (err: any) {
      console.error("Issue: " + err.message);
      if (err.message.includes("Failed to fetch"))
        toast.error("Server Error");
      else
        toast.error(err.message);
    }
  };

  const verifyOTP = async (mode: "login" | "register") => {
    try {
      let url: string;
      let body: any = {};
      if (mode === "login")
      {
        url = "otp_verify_login";
        body = { email: verifyRef.current.email, otp: verifyRef.current.otp };
      }
      else
      {
        url = "otp_verify_register"
        body = { username: verifyRef.current.username, email: verifyRef.current.email, password: verifyRef.current.password, otp: verifyRef.current.otp };
      }

      await apiFetch(url, { method: "POST", body: JSON.stringify(body) });
      toast.success("Verified success!");
      navigate("/");

    } catch (err: any) {
      console.error("Issue: " + err.message);
      if (err.message.includes("Failed to fetch"))
      {
        toast.error("Server Error");
        console.error(err.status);
      }
      else
        toast.error(err.message);
    }
  }

  return (
  <>
    <div className="relative flex flex-col justify-center items-center h-100 w-100 bg-gray-300 gap-2">
      <h1 className="absolute top-0 text-2xl font-extrabold mb-2 mt-5">KLBQ</h1>
      <div className="flex flex-col justify-center items-center bg-[rgba(199,237,206,1)] rounded-xl w-75 h-[60%] shadow-2xl text-justify">
        
      {showOTP && <OTPModal verifyRef={verifyRef} onVerify={() => verifyOTP(mode)} />}
      { mode === "register" ? <Register verifyRef={verifyRef} onSubmit={handleRegister} /> :
        (
          <>
            <LoginForm verifyRef={verifyRef} onSubmit={handleLogin} />
            <hr className="h-px min-w-70 my-3 bg-red-700 border-1"></hr>
            <button onClick={() => setMode("register")} className="border-black-300 border-2 rounded-lg p-1">Register</button>
          </>
        )
      }
      </div>
    </div>
  </>
  );
}
