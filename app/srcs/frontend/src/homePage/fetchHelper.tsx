import React from "react";
import type { User } from "../../../backend/share/type/user";
import { withTranslation, type TranslationProps } from "../_hooks/language";
import { apiFetchPrivate } from "../utils";
import type { Progress } from "./HomeChildC";
import { Outlet } from "react-router-dom";

type ProgressObj<T> = {
  name: string;
  api: () => Promise<T>;
  setter: React.Dispatch<React.SetStateAction<T | null>> | null;
};

type fetchDataProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
}

//fetch User Data helper function
export async function loadData({ setLoading, setProgress, setUser }: fetchDataProps, { t, toasterPluz }: TranslationProps ) {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  const progress: [ ProgressObj<any>, ProgressObj<User> ] =
  [
    { name: t("loading.step_checkUser"), api: () => apiFetchPrivate("me", { method: "GET" }), setter: null },
    { name: t("loading.step_fetchUser"), api: () => apiFetchPrivate("profile", { method: "POST", body: "{}" }), setter: setUser },
  ]

  try {
    for (let i = 0; i < progress.length; ++i)
    {
      const { name, api, setter } = progress[i];

      setProgress(prev => ({
        ...prev, step: name, completed: prev.completed, }));

      const data = await api();
      // console.info("Data Fetched:\n",data);
      if (setter)
        setter(data);

      setProgress(prev => ({
        ...prev, completed: prev.completed !== null ? prev.completed + 1 : 0, }));

      await sleep(500);
    }

    setProgress({ step: t("loading.step_complete"), completed: null, total: null });
    await sleep(500);
    setLoading(false);
    console.log("User data fetched");

  } catch (err: any) {
    toasterPluz(err);
  }
};

//OutletContext - User
function fetchD({ t, toasterPluz }: TranslationProps) { 
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<Progress>({ step: `${t("loading.step_start")}`, completed: null, total: 2 });

  React.useEffect(() => {
    console.log("Fetching data...");
    setTimeout(() => {
      loadData({ setLoading, setProgress, setUser }, { t, toasterPluz });
    }, 500);
  }, []);

  const refetchData = React.useCallback(() => {
    console.log("Refetch triggered");
    setTimeout(() => {
      loadData({ setLoading, setProgress, setUser }, { t, toasterPluz });
    }, 500);
  }, []);

  return (
    <OnlineProvider user={user} loading={loading} >
      <Outlet context={{ user, loading, progress, refetchData}} />
    </OnlineProvider>
  );
}

export const FetchData = withTranslation(fetchD);

//ContextProvider - Online Users @ WebSocket
export type Online = {
  id: number,
  username: string,
}

export type OnlineContextProps = {
  onlineUsers: Online[],
  socket: WebSocket | null;
}

const OnlineContext = React.createContext<OnlineContextProps | null>(null);

export function OnlineProvider({ user, loading, children }: { user: User | null, loading: boolean, children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = React.useState<Online[]>([]);
  const [socket, setSocket] = React.useState<WebSocket | null>(null);

  React.useEffect(() => {
    if (!user || loading) return ;
    const ws = new WebSocket(import.meta.env.VITE_API_ONLINE);
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "init", id: user?.acc.user_id, username: user?.acc.username }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      switch (data.type) {
        case "init":
          // console.log("Online_> socket created");
          setOnlineUsers(data.list);
          break ;

        case "update":
          console.log("Online_> up to date");
          setOnlineUsers(data.list);
          break ;

        case "ping":
          // console.warn("Online_> you send ping, i send pong");
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "pong" }));
          }
          break ;

        case "log_out":
          console.log("Online_>", data.message);
          break ;
        case "error":
          console.log("Online_> ",data.message);
          break ;
      }
    };

    ws.onerror = (error) => console.log(error);
    ws.onclose = (event) => console.warn(`Online_> Socket closed! ${event.code} ${event.reason}`);

    return () => {
      ws.close();
      console.warn(`Online_> Socket closed! (Clean Up)`);
      setSocket(null);
    }
  }, [loading]);


  return (
    <OnlineContext.Provider value={{ socket, onlineUsers, }}>
      {children}
    </OnlineContext.Provider>
  );
}

export const useSocket = (): OnlineContextProps => {
  const context = React.useContext(OnlineContext);
  if (!context) {
    throw new Error("useSocket is used outside its provider!");
  }
  return context;
};