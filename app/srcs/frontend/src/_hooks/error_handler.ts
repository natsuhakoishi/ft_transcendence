import React from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type ApiEventKey = "401" | "503" | "404";

let globalErrorHandler: Record<ApiEventKey, (() => void) | null> = {
  "401": null,
  "503": null,
  "404": null,
};

export function useGlobalErrorMonitor() {
  const navigate = useNavigate();

  React.useEffect(() => {

    //Access Token Expired
    globalErrorHandler["401"] = () => {
      toast.error("Session expired. Redirecting...");
      navigate("/auth", { replace: true });
    };

    //Backend Server Down
    globalErrorHandler["503"] = async () => {
      toast.error("Server disconnect. Retrying...");
      // const currentPath = location.pathname;

      await new Promise(r => setTimeout(r, 1000 * 25));

      try {
        const res = await fetch(`${import.meta.env.VITE_API_PRI_FETCH}me`, { credentials: "include" });
        if (!res.ok) throw new Error("Still unreachable");

        toast.success("Reconnected!");
        window.location.reload();
      } catch {
        toast.error("Server still unreachable. Redirecting...");
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      }
    };

    //User not found
    globalErrorHandler["404"] = () => {
      toast.error("User not found. Redirecting...");
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