import { useLang } from "../../_hooks/language";
import { isMobile } from "../../utils";
import { Countdown } from "./countdown";

export function Banner({
        confirm, 
        start, ready
    }: {
        confirm: boolean,
        start: boolean,
        ready: boolean,
    }) {

    const { t } = useLang();

    return (
        <>
            {
                !confirm ? (
                    <Countdown
                        start={10}
                        describe={isMobile() ? t("shared.game.preparing_mob") : t("shared.game.preparing")} />
                ) : !start ? (
                    <h1 className="text-3xl font-bold text-center">{t("shared.game.waiting")}</h1>
                ) : ready ? (
                        <Countdown
                        start={2}
                        describe={t("shared.game.ready")} />
                ) : <h1 className="text-3xl font-bold text-center">{t("shared.game.onGoing")}</h1>
            }
        </>
    )
}
