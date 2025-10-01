import React from "react"

export function Countdown({
        start,
        timeout,
        describe
    } : {
        start: number,
        timeout: () => void,
        describe: string}) {

    const [ second, setSecond ] = React.useState<number>(start);

    React.useEffect( () => {
        console.log("cd: useEffect");
        if (second <= 0)
        {
            console.log("cd: Timeout");
            timeout();
            return ;
        }

        const timer = setInterval(() => {
            setSecond((prev) => prev - 1)
            console.log("cd: ", second);
        }, 1000);

        return () => clearInterval(timer);    
    }, [])

    return (
        <div className="text-3xl font-bold text-center">
            <h1>{describe} {second} Second </h1>
        </div>
    );
}