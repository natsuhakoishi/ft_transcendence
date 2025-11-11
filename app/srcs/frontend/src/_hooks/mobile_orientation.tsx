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
  const { isPortrait, isMobile } = useOrientation();

  const showOverlay = isMobile && isPortrait;

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-center items-center text-white text-center px-6">
          <img src="/pic/icons/rotate_warn.png" className="w-20 aspect-square object-cover"/>
          <p className="text-xl font-semibold">Rotate your device !</p>
        </div>
      )}

      {!showOverlay && children}
    </>
  );
}