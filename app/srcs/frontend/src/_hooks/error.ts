import React from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLang } from "./language";

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
      toast.error(t("pop.401"));
      timer = setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 500);
    };

    //Backend Server Down
    globalErrorHandler["503"] = async () => {
      toast.error(`${t("pop.503")}`);
      // const currentPath = location.pathname;

      await new Promise(r => setTimeout(r, 1000 * 5));

      try {
        const res = await fetch(`${import.meta.env.VITE_API_PRI_FETCH}me`, { credentials: "include" });
        if (!res.ok) throw new Error("Still unreachable");

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
      toast.error(t("pop.USER-404"));
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
