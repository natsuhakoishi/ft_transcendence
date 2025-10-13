import React from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLang } from "./language";

type ApiEventKey = "401" | "503" | "404";

let globalErrorHandler: Record<ApiEventKey, (() => void) | null> = {
  "401": null,
  "503": null,
  "404": null,
};

export function useGlobalErrorMonitor() {
  const navigate = useNavigate();
  const { t } = useLang();

  React.useEffect(() => {

    //Access Token Expired
    globalErrorHandler["401"] = () => {
      toast.error(t("shared.error.401"));
      navigate("/auth", { replace: true });
    };

    //Backend Server Down
    globalErrorHandler["503"] = async () => {
      toast.error(`${t("shared.error.503")}`);
      // const currentPath = location.pathname;

      await new Promise(r => setTimeout(r, 1000 * 25));

      try {
        const res = await fetch(`${import.meta.env.VITE_API_PRI_FETCH}me`, { credentials: "include" });
        if (!res.ok) throw new Error("Still unreachable");

        toast.success(t("shared.error.503-success"));
        window.location.reload();
      } catch {
        toast.error(t("shared.error.503-fail"));
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      }
    };

    //User not found
    globalErrorHandler["404"] = () => {
      toast.error(t("shared.error.404"));
      navigate("/auth", { replace: true });
    };

    return () => {
      Object.keys(globalErrorHandler).forEach(k => (globalErrorHandler[k as ApiEventKey] = null));
    };

  }, [navigate, location]);
}

export function getGlobalErrorHandler(key: ApiEventKey) {
  return globalErrorHandler[key] || (() => {});
}