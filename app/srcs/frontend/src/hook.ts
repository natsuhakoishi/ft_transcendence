import React from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type ApiEventKey = "401" | "NETWORK_ERROR" | "USER_NOT_FOUND";

let globalErrorHandler: Record<ApiEventKey, (() => void) | null> = {
  "401": null,
  "NETWORK_ERROR": null,
  "USER_NOT_FOUND": null,
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
    globalErrorHandler["NETWORK_ERROR"] = async () => {
      toast.error("Cannot connect to server. Retrying...");
      // const currentPath = location.pathname;

      await new Promise(r => setTimeout(r, 1000 * 25));

      try {
        const res = await fetch(`${import.meta.env.VITE_API_PRI_FETCH}me`, { credentials: "include" });
        if (!res.ok) throw new Error("Still unreachable");

        toast.success("Reconnected!");
        window.location.reload();
      } catch {
        toast.error("Server still unreachable. Redirecting to login...");
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 2000);
      }
    };

    //User not found
    globalErrorHandler["USER_NOT_FOUND"] = () => {
      toast.error("User not found.");
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