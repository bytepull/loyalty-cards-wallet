"use client";

import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { IoCloseOutline } from "react-icons/io5";

export default function Scanner({
  close,
}: {
  close: (decodedText: string, format: string) => void;
}) {
  const html5QrCode = useRef<Html5Qrcode | null>(null);
  const closeCallback = useRef(close);

  // Update the ref when close changes
  useEffect(() => {
    closeCallback.current = close;
  }, [close]);

  useEffect(() => {
    // Only initialize if not already initialized
    if (!html5QrCode.current) {
      html5QrCode.current = new Html5Qrcode("scan-element", true);

      console.log("Starting camera...");
      html5QrCode.current
        ?.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
          },
          (decodedText, result) => {
            console.log(`Code matched = ${decodedText}`, result);
            try {
              html5QrCode.current?.stop();
              console.log("Camera stopped.");
            } catch (error) {
              console.error("Error stopping camera:", error);
            } finally {
              closeCallback.current(
                decodedText,
                result.result.format!.formatName
              );
            }
          },
          (errorMessage, error) => {
            if (error.type === 0) return; // Ignore NotFoundException
            console.warn(`Code scan error = ${errorMessage}`, error);
          }
        )
        .catch((error) => {
          console.log("Error starting camera:", error);
          if (error.type === "NotAllowedError") {
            alert(
              "Camera permission is required to use the barcode scanner. Please allow camera access and try again."
            );
          } else {
            alert(
              "Unable to start camera. Please check permissions and try again."
            );
          }
        });
    }

    return () => {
      try {
        if (
          html5QrCode.current?.getState() === Html5QrcodeScannerState.SCANNING
        ) {
          html5QrCode.current?.stop();
          console.log("Camera stopped.");
        }
      } catch (error) {
        console.error("Error stopping camera:", error);
      }
    };
  }, []); // Keep empty dependency array

  const handleCloseScan = async () => {
    await html5QrCode.current?.stop();
    close("", "");
  };

  return (
    <div className="flex flex-col w-full h-full justify-center items-center p-6">
      <div id="scan-element" className="w-full h-[600px] flex"></div>
      <button
        onClick={handleCloseScan}
        className="rounded-4xl p-4 mt-5 bg-gray-300"
      >
        <IoCloseOutline className="size-6 text-gray-600" />
      </button>
    </div>
  );
}
