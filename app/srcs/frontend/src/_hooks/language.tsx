import React from "react";
import { bakery } from "../utils";

export type Lang = "en" | "zh" | "jp";

export const LanguageContext = React.createContext<any>(null);

export function useLanguage() {
  const storedLang = (localStorage.getItem("lang") as Lang) ?? "en";
  const [lang, setLang] = React.useState<Lang>(storedLang);
  const [translations, setTranslations] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const file = `${lang}.json`;
    const pop = `${lang}-pop.json`;

    Promise.all([
      fetch(`locales/${file}`)
        .then(res => res.json())
        .catch(() => {
          console.error(`Missing language file: ${file}`);
          return {};
        }),
      fetch(`locales/${pop}`)
        .then(res => res.json())
        .catch(() => {
          console.error(`Missing language file: ${pop}`);
          return {};
        }),
    ]).then(([Data, popData]) => {
      const merged = { ...Data, pop: popData, };
      setTranslations(merged);
      // console.log(merged);
      localStorage.setItem("lang", lang);
    });

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

  const toasterPluz = bakery(langPack.t);

  return (
    <LanguageContext.Provider value={{ ...langPack, toasterPluz }}>
      {children}
    </LanguageContext.Provider>
  );
};

export interface TranslationProps {
  t: (key: string) => string;
  lang?: string;
  toasterPluz: (key: string) => void;
}

export function withTranslation<T extends object>(
  Component: React.ComponentType<T & TranslationProps>
) {
  return (props: T) => {
    const { t, lang, toasterPluz } = useLang();
    return <Component {...props} t={t} lang={lang} toasterPluz={toasterPluz} />;
  };
}
