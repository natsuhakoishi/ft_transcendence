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

//Outlet Context
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
    <Outlet context={{ user, loading, progress, refetchData}} />
  );
}

export const FetchData = withTranslation(fetchD);

//Socket Provider
