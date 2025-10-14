import React from "react";
import toast from "react-hot-toast";

export type Lang = "en" | "zh" | "jp";

export const LanguageContext = React.createContext<any>(null);

export function useLanguage() {
  const storedLang = (localStorage.getItem("lang") as Lang) ?? "en";
  const [lang, setLang] = React.useState<Lang>(storedLang);
  const [translations, setTranslations] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const files = [`${lang}.json`, `${lang}-pop.json`];

    Promise.all(
      files.map(file =>
        fetch(`locales/${file}`)
          .then(res => res.json())
          .catch(() => {
            console.error(`Missing language file: ${file}`);
            return {};
          })
      )
    ).then((results) => {
      const merged = Object.assign({}, ...results);
      setTranslations(merged);
      // console.log(merged);
    });
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (key: string): string =>
    key.split('.').reduce((obj: any, k) => obj && obj[k], translations) || key;

  return { lang, setLang, t, translations };
}

export const useLang = () => React.useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const langPack = useLanguage();

  if (!Object.keys(langPack.translations).length)
    return <div className="text-xl">Translation loading..</div>;

  return (
    <LanguageContext.Provider value={langPack}>
      {children}
    </LanguageContext.Provider>
  );
};

export function withTranslation<T extends { t: Function; lang?: string }>(
  Component: React.ComponentType<T>
) {
  return (props: Omit<T, "t">) => {
    const { t, lang } = useLang();
    return <Component {...(props as T)} t={t} lang={lang} />;
  };
}

export function useToaster() {
  const { t } = useLang();

  return (res: any) => {
    const key = String(res.status || "SWR");
    const message = t(key);
    //500, server error when processed request
    //200, request success
    //400, bad request

    const type = key.startsWith("OK") ? "success" : "error";
    toast[type](message);
  };
}