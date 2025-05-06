import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { FiPlusSquare, FiShare } from "react-icons/fi";

function isLikelyIOS(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const hasTouch = "ontouchstart" in window;
  const isIPadOrIPhone = /ipad|iphone|ipod/.test(userAgent);
  const notWindows = !/windows/.test(userAgent);

  console.log("isLikelyIOS", {
    isIPadOrIPhone,
    hasTouch,
    notWindows,
  });

  // Combination of factors that strongly suggest iOS
  return isIPadOrIPhone && hasTouch && notWindows;
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mainElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsIOS(isLikelyIOS());
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
    setTimeout(() => {
      setIsVisible(true);
    }, 2000);
  }, []);

  if (isStandalone) return null; // Don't show install button if already installed
  
  if (!isIOS) return null; // Only show install button for iOS
  
  return (
    <div
      ref={mainElement}
      className={`z-50 bg-white p-4 fixed top-0 left-0 w-screen h-fit origin-top transition-all duration-600 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="w-full bg-white shadow-md flex flex-col items-center justify-center gap-2 p-5 space-y-4">
        <p className="text-2xl">Install App</p>
        <div className="space-y-6 w-full px-6">
          <p className="text-lg">To install this app on your iOS device:</p>
          <div className="flex w-full items-center">
            <p className="flex-1">1. Tap the share button</p>
            <FiShare className="w-7 h-7" />
          </div>
          <div className="flex w-full items-center">
            <p className="flex-1">2. Click on &quot;Add to Home Screen&quot;</p>
            <FiPlusSquare className="w-7 h-7" />
          </div>
        </div>
        <div className="w-full px-14 mt-4">
          <button
            className="rounded-xl p-3 bg-slate-100 w-full"
            onClick={() => setIsVisible(false)}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
