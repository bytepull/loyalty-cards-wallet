import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { FiPlusSquare, FiShare } from "react-icons/fi";

const COOKIE_NAME = "install_prompt_confirmed";
const PROMPT_DELAY = 2000;
const COOKIE_EXPIRY_DAYS = 30;

function getDevice(): string | null {
  const userAgent = navigator.userAgent.toLowerCase();
  const hasTouch = "ontouchstart" in window;
  const isIOS = /ipad|iphone|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const notWindows = !/windows/.test(userAgent);

  if (!hasTouch || !notWindows) return null;
  return isIOS ? "ios" : isAndroid ? "android" : null;
}

function setCookie(name: string, value: string, days: number) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/`;
}

function InstallPrompt() {
  const [device, setDevice] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const mainElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.cookie.includes(`${COOKIE_NAME}=true`)) return;

    setDevice(getDevice());
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    const timeout = setTimeout(() => setIsVisible(true), PROMPT_DELAY);
    return () => clearTimeout(timeout);
  }, []);

  const handleConfirmation = () => {
    setCookie(COOKIE_NAME, "true", COOKIE_EXPIRY_DAYS);
    setIsVisible(false);
  };

  if (isStandalone) return null;

  const messageForIos = (
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
  );

  const messageForDevice =
    device === "ios" ? (
      messageForIos
    ) : device === "android" ? (
      <p className="text-lg">Coming soon!</p>
    ) : (
      <></>
    );

  if (!device) return null;

  return (
    <div
      ref={mainElement}
      className={`z-50 bg-inherit p-4 fixed top-0 left-0 w-screen h-fit origin-top transition-all duration-600 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="w-full dark:bg-gray-800 bg-(--background) shadow-md flex flex-col items-center justify-center gap-2 p-5 space-y-4">
        <p className="text-2xl">Install App</p>
        {messageForDevice}
        <div className="w-full px-14 mt-4">
          <button
            className="rounded-xl p-3 w-full"
            onClick={handleConfirmation}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
