import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "./utils";

const GoogleLogIn: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button onClick={onClick} type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 ">
      <svg className="w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
        <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
      </svg>
    Sign in with Google
    </button>
  );
}

interface OTPModalProps {
  mail: string,
  otp: string,
  setOTP: (v:string) => void,
  onVerify: (email:string, otp:string) => void
}

const OTPModal = ({ mail, otp, setOTP, onVerify }: OTPModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="flex flex-col items-center justify-center gap-2 bg-blue-200 rounded-lg shadow-lg p-6 w-1/2">
        <h2 className="items-center text-center font-bold">Enter OTP</h2>
        <input
          type="text" pattern="\d{6}" maxLength={6} required placeholder="6-digit code"
          value={otp} onChange={(e) => setOTP(e.target.value)}
          className="border w-2/3 p-1 text-center"/>
        <button className="relative inline-flex items-center justify-center mx-2 p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-2 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          onClick={() => onVerify(mail,otp)}>
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Verify OTP
          </span>
        </button>
      </div>
    </div>
  );
}
//memo have to use certain like onKeyDown to prevent user from type non digit
//todo dismiss button -> should able to submit new OTP to same / diff email

interface LoginFormProps {
  onSubmit: (body: {email: string; password: string;}) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries()) as { email: string; password: string };
    onSubmit(body);
  };
  return (
    <>
      <form className="flex flex-col items-center w-full m-2" 
      id="login-form" onSubmit={handleSubmit}>
      <input className="p-0.5 m-2 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
        type="email" id="login-email" name="email" placeholder="Enter email address" required autoComplete="email"
      />
      <input className="p-0.5 m-2 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
      type="password" id="login-password" name="password" placeholder="Enter password" required autoComplete="current-password"
      />
      <button type="submit" className="border-black-300 border-2 rounded-lg p-1">Sign in</button>
      </form>
    </>
  );
}

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  }, []);
  
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const [mail, setMail] = useState("");

  const handleLoginGoogle = async () => {
    try {
      window.location.href = "https://localhost:4242/api/auth/google";
      //会卡在auth结果
      // 如果 Google callback 把 token 放在 URL (例如 /?token=xxx)
      // window.addEventListener("DOMContentLoaded", () => {
      //   const params = new URLSearchParams(window.location.search);
      //   const token = params.get("token");
      //   if (token) {
      //     localStorage.setItem("token", token);
      //     log("✅ Google Login successful!");
      //     fetchProfile();
      //     fetchFriends();
      //     // 清掉網址上的 query
      //     window.history.replaceState({}, document.title, window.location.pathname);
      //   }
      // });

    } catch (err: any) {
      console.log(err.message);
      toast.error("Something went wrong, try again!");
    }
  };

  const handleLogin = async (body: { email: string; password: string }) => {
    try {
      toast("Submit succesful. Loading...");
      const res = await apiFetch("login", { method: "POST", body: JSON.stringify(body) } );
      const data = await res.json();

      if (res.ok)
      {
        toast.success(data.message);
        if (data.requireOTP)
          setShowOTP(true);
        setMail(body.email);
      }
      else
        toast.error("Something went wrong.");//memo i wonder if it actually will return here, i think is caught all by the catch
    } catch (err: any) {
      console.log(err.message);
      toast.error("Something went wrong, try again!");
    }
  };

  const verifyLogin = async (email:string, otp:string) => {
    try
    {
      const body = { email, otp };
      const res = await apiFetch("otp_verify_login", { method: "POST", body: JSON.stringify(body) } );
      const data = await res.json();

      if (res.ok)
      { 
          navigate("/");
      }
      else
        toast.error(data.message);
    } catch (err: any) {
      console.log(err.message);
      toast.error("Fail to verify token!");
    }
    //memo initially fetch user data & friend data here
  }

  return (
  <>
    <div className="flex flex-col justify-start items-center h-100 w-100 bg-gray-300">
      <h1 className="text-2xl font-extrabold mb-2 mt-5">KLBQ</h1>
      <div className="flex flex-col items-center bg-[rgba(199,237,206,1)] rounded-xl w-75 h-2/3 shadow-2xl text-justify mx-3">
        <LoginForm onSubmit={handleLogin} />
        <GoogleLogIn onClick={handleLoginGoogle} />
        {showOTP && <OTPModal mail={mail} otp={otp} setOTP={setOTP} onVerify={verifyLogin} />}
      </div>
    </div>
  </>
  );
}

//todo change all net::ERR_CONNECTION_REFUSED error to "Server reject? or maybe server not up"