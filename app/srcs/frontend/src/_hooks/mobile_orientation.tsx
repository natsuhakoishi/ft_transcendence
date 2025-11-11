import React from "react";
import { isMobile } from "../utils";

function useOrientation() {
  const getState = () => {
    const isPortrait = window.innerHeight > window.innerWidth;
    return { isPortrait, isMobile: isMobile() };
  };

  const [state, setState] = React.useState(getState);

  React.useEffect(() => {
    const handleResize = () => setState(getState());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return state;
}

export default function OrientationGuard({ children } : { children: React.ReactNode }) {

  const { isPortrait } = useOrientation();
  const showOverlay = isPortrait;

  return (
    <>
      {showOverlay && (
        <div className="fixed w-screen h-screen inset-0 z-[100] flex flex-col justify-center items-center text-white">
          <div className="flex gap-2 items-start mt-2">
            <img src="/pic/icons/rotate_warn.png" className="w-20 aspect-square object-contain"/>
            <img src="/pic/icons/rotate_plz.gif" className="w-20 aspect-square object-cover"/>
            <img src="/pic/icons/rotate_warn_3.png" className="w-17 aspect-square object-cover"/>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <p className="text-xl font-semibold">Rotate your device !</p>
            <img src="/pic/icons/rotate_warn_2.png" className="w-14 aspect-square object-cover"/>
          </div>
        </div>
      )}

      {!showOverlay && children}
    </>
  );
}