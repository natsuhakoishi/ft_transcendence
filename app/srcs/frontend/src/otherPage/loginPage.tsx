import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils";
import { useLang, withTranslation, type TranslationProps } from "../_hooks/language";

const Register = ( { verifyRef, onSubmit, mode }: {
  verifyRef: React.RefObject<VerifyBody>,
  onSubmit: () => void,
  mode: React.Dispatch<React.SetStateAction<"login" | "register">>,
}) => {
  const { t } = useLang();
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
      <form className="flex flex-col items-center justify-center w-full gap-2 default_text" onSubmit={handleSubmit}>
        <input className="p-1.5 rounded-lg placeholder-gray-400 placeholder-opacity-10 bg-green-100"
          type="text" name="username" placeholder={t("shared.form.place_name")} required autoComplete="on"
        />
        <input className="p-1.5 rounded-lg placeholder-gray-400 placeholder-opacity-10 bg-green-100"
          type="email" name="email" placeholder={t("shared.form.place_email")} required autoComplete="email"
        />
        <input className="p-1.5 rounded-lg placeholder-gray-400 placeholder-opacity-10 bg-green-100"
        type="password" name="password" placeholder={t("shared.form.place_password")} required autoComplete="current-password"
        />
        <div className="flex gap-2">
          <button type="submit" className="default_button hover-increase">{t("auth.btn_register")}</button>
          <button type="button" onClick={() => mode("login")} className="default_button hover-increase">{t("shared.btn_cancel")}</button>
        </div>
      </form>
    </>
  );
}

const OTPModal = ({ show, verifyRef, onVerify }: {
  show: React.Dispatch<React.SetStateAction<boolean>>,
  verifyRef: React.RefObject<VerifyBody>,
  onVerify: () => void,
}) => {
  const { t } = useLang();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 w-full max-w-full">
      <div className="relative flex flex-col items-center justify-center gap-2 bg-blue-200 rounded-lg shadow-lg p-6 w-[30%]">
        <button onClick={() => show(false)} className="absolute top-0 right-1 my-1 mr-1 text-black">✘</button>
        <h2 className="items-center text-center font-bold">{t("auth.msg_otp")}</h2>
        <input
          type="text" pattern="\d{6}" maxLength={6} required placeholder={t("auth.place_otp")}
          onChange={(e) => (verifyRef.current.otp = e.target.value)}
          className="border w-2/3 p-1 text-center"/>
        <button className="relative inline-flex items-center justify-center mx-2 p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-2 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          onClick={onVerify}>
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            {t("auth.btn_verify")}
          </span>
        </button>
      </div>
    </div>
  );
}

const LoginForm = ({ verifyRef, onSubmit }: { verifyRef: React.RefObject<VerifyBody>, onSubmit: () => void }) => {
  const { t } = useLang();
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
        type="email" name="email" placeholder={t("shared.form.place_email")} required autoComplete="email"
      />
      <input className="p-0.5 rounded-lg border-2 border-green-400 placeholder-gray-400 placeholder-opacity-10 bg-green-100"
      type="password" name="password" placeholder={t("shared.form.place_password")} required autoComplete="current-password"
      />
      <button type="submit" className="border-black-300 border-2 rounded-lg p-1 mt-2">{t("auth.btn_signIn")}</button>
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

export function LoginP({ t, toasterPluz }: TranslationProps) { 
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showOTP, setShowOTP] = useState(false);
  const verifyRef = useRef<VerifyBody>({ email: "", otp: "" });

  useEffect(() => {
    document.title = mode === "login" ? t("auth.title_login") : t("auth.title_register");
  }, [mode]);

  const handleRegister = async () => {
    try {
      if (verifyRef.current.username && (verifyRef.current.username.length < 3 || verifyRef.current.username.length > 8)) {
        if (verifyRef.current.username.length > 8)
          toasterPluz("ERR_NameTooLong");
        else
          toasterPluz("ERR_NameTooShort");
        return ;
      }

      if (verifyRef.current.password && verifyRef.current.password.length < 8) {
        toasterPluz("ERR_PasswordLen");
        return ;
      }
      //feat password management

      toasterPluz("auth.MSG_CONNECTING");
      const data = await apiFetch("register", { method: "POST", body: JSON.stringify(verifyRef.current) });
      if (data.requireOTP)
        setShowOTP(true);
      toasterPluz(data);
    } catch (err: any) { 
      toasterPluz(err);
    }
  }

  const handleLogin = async () => {
    try {
      toasterPluz("auth.MSG_CONNECTING");
      const data = await apiFetch("login", { method: "POST", body: JSON.stringify(verifyRef.current) });
      if (data.requireOTP)
        setShowOTP(true);
      toasterPluz(data);
    } catch (err: any) {
      toasterPluz(err);
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
      toasterPluz("auth.OK_VerifyOTP");
      navigate("/");
    } catch (err: any) {
      toasterPluz(err);
    }
  }

  return (
  <>
    <div className="relative flex flex-col justify-center items-center h-screen w-100 bg-gray-300 gap-2">
      <h1 className="absolute top-5 text-2xl font-extrabold mb-2 mt-5">KLBQ</h1>
      <div className="flex flex-col justify-center items-center bg-[rgba(199,237,206,1)] rounded-xl w-75 h-[60%] shadow-2xl text-justify">
        
      {/* OTP Verification Modal (Shared) */}
      {showOTP && <OTPModal show={setShowOTP} verifyRef={verifyRef} onVerify={() => verifyOTP(mode)} />}

      {/* Display Login Modal or Register Modal */}
      { mode === "register" ? <Register verifyRef={verifyRef} onSubmit={handleRegister} mode={setMode} /> :
        (
          <>
            <LoginForm verifyRef={verifyRef} onSubmit={handleLogin} />
            <hr className="h-px min-w-70 my-3 border-1"></hr>
            <button onClick={() => setMode("register")} className="border-black-300 border-2 rounded-lg p-1">{t("auth.btn_register")}</button>
          </>
        )
      }

      {/* todo Warning Context: valid email address */}

      </div>
    </div>
  </>
  );
}

export const LoginPage = withTranslation(LoginP);