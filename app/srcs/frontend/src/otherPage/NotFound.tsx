import React from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../_hooks/language";

function NotFound() {
    const navigate = useNavigate();
    const { t } = useLang();
    const [counter, setCounter] = React.useState(2000);

    React.useEffect( ()=> {
        const interval = setInterval(() => {
            setCounter(prev => {
                const next = prev - 1000;
                if (next <= 0) {
                    clearInterval(interval);
                    navigate("/", { replace: true });
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-extrabold">{t("404_page")}</h1>
            <p className="mt-5 text-center">{t("404_msg")}{Math.ceil(counter / 1000)} {t("shared.second")}</p>
        </div>
    );
}

export default NotFound;