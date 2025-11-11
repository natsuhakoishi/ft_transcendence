import React from "react";

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
  const isPortrait = window.innerHeight > window.innerWidth;

  const showOverlay = isPortrait;

  return (
    <>
      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center text-white text-center">
          <img src="/pic/icons/rotate_warn.png" className="w-25 aspect-square object-cover"/>
          <img src="/pic/icons/rotate_plz.gif" className="w-25 aspect-square object-cover"/>
          <div className="flex gap-10 items-start mt-2">
            <img src="/pic/icons/rotate_warn_3.png" className="w-25 aspect-square object-cover"/>
            <img src="/pic/icons/rotate_warn_2.png" className="w-20 aspect-square object-cover my-10"/>
          </div>
        </div>
      )}

      {!showOverlay && children}
    </>
  );
}