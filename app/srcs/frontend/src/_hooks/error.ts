import React from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLang } from "./language";
import { apiFetchPrivate } from "../utils";

let globalErrorHandler: Record<string, (() => void) | null> = {
  "401": null, "503": null, "404": null,
};

export function useGlobalErrorMonitor() {
  let timer: any;
  const navigate = useNavigate();
  const { t } = useLang();

  React.useEffect(() => {
    //Access Token Expired
    globalErrorHandler["401"] = () => {
      timer = setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 500);
    };

    //Backend Server Down
    globalErrorHandler["503"] = async () => {
      await new Promise(r => setTimeout(r, 1000 * 5));
      try {
        await apiFetchPrivate("me", { method: "POST", body: "{}" });
        toast.success(t("pop.503-SUCCESS"));
        window.location.reload();
      } catch {
        toast.error(t("pop.503-FAIL"));
        timer = setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 500);
      }
    };

    //User not found
    globalErrorHandler["404"] = () => {
      toast.error(t("pop.ERR_USER-404"));
      timer = setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 500);
    };

    return () => {
      Object.keys(globalErrorHandler).forEach(k => (globalErrorHandler[k as string] = null));
      if (timer) clearTimeout(timer);
    };
  }, [navigate, location]);
}

export function getGlobalErrorHandler(key: string) {
  return globalErrorHandler[key] || (() => {});
}

//behaviour set without toast, toast already baked beforehand