import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils";
import { useLang, withTranslation, type TranslationProps } from "../_hooks/language";
import { LanguageBar } from "../homePage/home";

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
      <form className="flex flex-col items-center w-full gap-1 md:gap-2" onSubmit={handleSubmit}>
        <input className="bg-green-100 default_placeholder"
          type="text" name="username" placeholder={t("shared.form.place_name")} required autoComplete="on"
        />
        <input className="bg-green-100 default_placeholder"
          type="email" name="email" placeholder={t("shared.form.place_email")} required autoComplete="email"
        />
        <input className="bg-green-100 default_placeholder"
        type="password" name="password" placeholder={t("shared.form.place_password")} required autoComplete="current-password"
        />
        <div className="flex gap-2 -mb-2 md:-mb-0 mt-1 md:mt-0.5">
          <button type="submit" className="text-white border-white default_button hover-increase">{t("auth.btn_register")}</button>
          <button type="button" onClick={() => mode("login")} className="text-white border-white default_button hover-increase">{t("shared.btn_cancel")}</button>
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
      <div className="relative flex flex-col items-center justify-center gap-2 bg-[#A4B9F1]/95 rounded-lg shadow-lg p-6 w-max-screen w-30% md:w-[25%]">
        <button onClick={() => show(false)} className="absolute top-0 right-1 my-1 mr-1 text-black cursor-pointer">✘</button>
        <h2 className="items-center text-center font-bold">{t("auth.msg_otp")}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="flex flex-col items-center gap-3">
          <input type="text" pattern="\d{6}" maxLength={6} required placeholder={t("auth.place_otp")} onChange={(e) => (verifyRef.current.otp = e.target.value)}
            className="border-2 w-2/3 text-center default_placeholder"/>
          <button type="submit"
            className="relative inline-flex items-center justify-center mx-2 p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group
            bg-gradient-to-br from-[#95B06F] to-[#5E76C0] group-hover:from-[#95B06F] group-hover:to-[#5E76C0] hover:text-white focus:outline-none"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 cursor-pointer hover:scale-110 bg-black rounded-md font-bold group-hover:bg-transparent group-hover:dark:bg-transparent">
              {t("auth.btn_verify")}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

const LoginForm = ({ verifyRef, onSubmit, children }: { verifyRef: React.RefObject<VerifyBody>, onSubmit: () => void, children: React.ReactNode }) => {
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
      <form className="flex flex-col items-center w-full gap-2" onSubmit={handleSubmit}>
        <input className="bg-green-100 default_placeholder"
          type="email" name="email" placeholder={t("shared.form.place_email")} required autoComplete="email"
        />
        <input className="bg-green-100 default_placeholder"
          type="password" name="password" placeholder={t("shared.form.place_password")} required autoComplete="current-password"
        />
        <div className="flex items-center md:flex-col gap-2 ">
          <button type="submit" className="md:mt-3 md:w-20 text-white default_button hover-increase">{t("auth.btn_signIn")}</button>
          {children}
        </div>
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
  <div className="relative w-[100dvw] h-[100dvh] flex flex-col justify-center items-center bg-cover bg-[url('/pic/authP.jpeg')] bg-blend-overlay">

    {/* Button -> Language Bar */}
    <div className="absolute top-0 md:top-2 right-0 md:right-2 m-2">
      <LanguageBar bgColor="" optionColor="bg-[#44332D]"/>
    </div>
    {/* Title */}
    <h1 className={`absolute top-0 md:top-8 text-4xl md:text-5xl font-extrabold text-shadow-lg font-[STHupo] [-webkit-text-stroke:1px rgba(115,107,148,0.8)]`}>FT_KLBQ</h1>
    {/* Form Modal -> Register / Login */}
    <div className="h-full w-[60%] flex flex-col justify-end md:justify-center items-center mb-3 bg-[#915C2E]/30 backdrop-blur-base gap-2">
      <div className="flex flex-col justify-center items-center bg-[#C9DB71]/90 rounded-xl w-75 h-[78%] md:h-[60%] shadow-2xl text-justify gap-2">

      <span className={`${mode === "register" && "hidden"} text-xs md:text-sm text-red-900`}>*Please provide a valid email address!</span>

      {/* OTP Verification Modal (Shared) */}
      {showOTP && <OTPModal show={setShowOTP} verifyRef={verifyRef} onVerify={() => verifyOTP(mode)} />}

      {/* Display Login Modal or Register Modal */}
      { mode === "register" ? <Register verifyRef={verifyRef} onSubmit={handleRegister} mode={setMode} /> :
        (
          <>
            <LoginForm verifyRef={verifyRef} onSubmit={handleLogin}>
              <hr className="hidden md:block h-px min-w-70 my-3 border-1"></hr>
              <button onClick={() => setMode("register")} className="md:w-20 default_button hover-increase">{t("auth.btn_register")}</button>
            </LoginForm>
          </>
        )
      }
      </div>
    </div>

  </div>
  );
}

export const LoginPage = withTranslation(LoginP);