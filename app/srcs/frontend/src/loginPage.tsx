import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (!(options.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  return fetch(`https://localhost:4242/api/${endpoint}`, { ...options, headers, credentials: 'include' });
}

const handleLoginGoogle = () => {
  // window.location.href = "https://localhost:4242/api/auth/google";
}

export function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login";
  }, []);
  
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState("");
  const [mail, setMail] = useState("");

  const verifyLogin = async (email:string, otp:string) => {
    try
    {
      const body = { email, otp };
      const res = await apiFetch("otp_verify_login", { method: "POST", body: JSON.stringify(body) } );
      const data = await res.json();

      if (res.ok)
        navigate("/temp"); //todo update to correct route
      else
        toast.error(data.message);
    }
    catch (err: any) {
      console.log(err.message || "Something went wrong when verifying, please try again!");
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const body = Object.fromEntries(formData.entries())  as { email: string; password: string };

    try
    {
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
        toast.error(data.message);
    } 
    catch (err: any)
    {
      console.log(err.message || "Something went wrong when login, please try again!");
    }
    //fetchProfile();
    //fetchFriends();
  }

return (
    <>
      <div className="flex flex-col justify-start items-center h-100 w-100 bg-gray-300">
        <h1 className="text-2xl font-extrabold mb-2 mt-5">KLBQ</h1>
          <div className="flex flex-col items-center bg-[rgba(199,237,206,1)] rounded-xl w-75 h-2/3 shadow-2xl text-justify mx-3">
            <form className="flex flex-col items-center w-full m-2" 
              id="login-form" onSubmit={handleLogin}>

              <input className="p-0.5 m-2 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
                type="email" id="login-email" name="email" placeholder="Enter email address" required autoComplete="email"
              />
              <input className="p-0.5 m-2 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
                type="password" id="login-password" name="password" placeholder="Enter password" required autoComplete="current-password"
              />
              <button type="submit" className="border-black-300 border-2 rounded-lg p-1">Sign in</button>
            
            </form>
            <button onClick={handleLoginGoogle}>Sign in via Google</button>
          </div>
          {showOTP && <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-80">
              <h2>Enter OTP</h2>
              <input type="number" placeholder="6-digit code" value={otp} onChange={(e) => setOTP(e.target.value)} required
                className="border rounded w-full p-2 mb-4"/>
              <button onClick={() => verifyLogin(mail, otp)}>Verify OTP</button>
            </div>
            </div>
          }
      </div>
    </>
  );
}