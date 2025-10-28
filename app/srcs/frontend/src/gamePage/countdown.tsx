import React from "react"
import { useLang } from "../_hooks/language";

export function Countdown({
        start,
        describe
    } : {
        start: number,
        describe: string}) {

    const [ second, setSecond ] = React.useState<number>(start);
    const timer = React.useRef<NodeJS.Timeout | null>(null);
    const { t } = useLang();

    React.useEffect( () => {
        if (second === 0)
        {
            console.log("cd: Timeout");
            if (timer.current) {
                clearInterval(timer.current);
                timer.current = null;
            }
            return ;
        }
    }, [second]);

    React.useEffect( () => {
        console.log("cd: useEffect");

        timer.current = setInterval(() => {
            setSecond((prev) => prev - 1)
            console.log("cd: ", second);
        }, 1000);

        return () => {
            if (timer.current)
                clearInterval(timer.current);    
        }
    }, [])

    return (
        <div className="text-3xl font-bold text-center">
            <h1>{describe} {second} {t("shared.second")} </h1>
        </div>
    );
}