"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, StorageService } from "@/app/lib/storage-services";
import Barcode from "react-barcode";
import Scanner from "@/app/ui/Scanner";
import { QRCodeSVG } from "qrcode.react";
import { IoCheckmark, IoCloseOutline } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { CiBarcode, CiCamera, CiImageOn, CiTrash } from "react-icons/ci";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const cardTemplate: Card = {
  storeName: "",
  cardNumber: "",
  codeType: "",
  notes: "",
};

export default function CardDisplay({
  card,
  close,
}: {
  card: Partial<Card>;
  close: () => void;
}) {
  const [isEditing, setIsEditing] = useState(
    !card.hasOwnProperty("cardNumber")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [editedCard, setEditedCard] = useState<Card | Partial<Card>>({
    ...cardTemplate,
    ...card,
  });
  const db = useRef<StorageService>(null);
  const scanMenu = useRef<HTMLDivElement>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    db.current = new StorageService();
    html5QrCode.current = new Html5Qrcode("scan-element", true);
  }, []);

  const handleScannerResult = (decodedText: string, format: string) => {
    handleInputChange("cardNumber", decodedText);
    handleInputChange("codeType", format);
    setShowScan(false);
  };

  async function openPhotoLibrary() {
    setIsLoading(true);

    // Create file input and handle selection
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      if (
        !e.target ||
        !(e.target as HTMLInputElement).files ||
        (e.target as HTMLInputElement).files!.length === 0
      ) {
        // No file selected, ignore
        return;
      }
      const imageFile = (e.target as HTMLInputElement).files?.[0];
      if (!imageFile) {
        // No file selected, ignore
        return;
      }
      // Scan QR Code
      html5QrCode.current
        ?.scanFileV2(imageFile, true)
        .then((value) => {
          console.log(value.decodedText);
          handleInputChange("cardNumber", value.decodedText);
          handleInputChange("codeType", value.result.format!.formatName);
        })
        .catch((err) => {
          // failure, handle it.
          alert("No barcode detected in image");
          console.log(`Error scanning file. Reason: ${err}`);
        })
        .finally(() => setIsLoading(false));
    };

    input.oncancel = () => setIsLoading(false);
    input.click();
  }

  const handleSave = async () => {
    if (
      !editedCard.storeName ||
      !editedCard.cardNumber ||
      !editedCard.codeType
    ) {
      return window.alert("Please enter store name, card number and code type");
    }

    if (!card.cardNumber) {
      await db.current!.addCard(editedCard as Card);
    } else {
      await db.current!.updateCard(editedCard as Card);
    }

    setIsEditing(false);
    close();
  };

  const handleClose = () => {
    if (
      !isEditing ||
      window.confirm("Are you sure you want to cancel editing?")
    )
      close();
  };

  const handleDeleteCard = async () => {
    if (!editedCard.cardNumber) return;
    if (window.confirm("Are you sure you want to delete this card?")) {
      await db.current!.deleteCard(editedCard.cardNumber);
      close();
    }
  };

  function handleInputChange(field: string, value: string | number) {
    setEditedCard((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const handleScanOptions = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget as HTMLButtonElement;
    const buttonRect = button.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - buttonRect.right;
    scanMenu.current!.classList.toggle("hidden");
    if (spaceOnRight < 224) {
      scanMenu.current!.classList.remove("left-0");
      scanMenu.current!.classList.add("right-0");
    } else {
      scanMenu.current!.classList.remove("right-0");
      scanMenu.current!.classList.add("left-0");
    }
  };

  const nocode = (
    <div className="text-center not-dark:text-gray-400">No code</div>
  );

  const code = () => {
    // If card number is not provided, return no code
    if (!editedCard.cardNumber || !editedCard.codeType) return nocode;

    if (editedCard.codeType.toLowerCase().includes("qr"))
      return (
        <div className="flex flex-col justify-center items-center">
          <QRCodeSVG value={editedCard.cardNumber} />
          <div className="mt-4">{editedCard.cardNumber}</div>
        </div>
      );

    const codeformat = [
      "CODE39",
      "CODE128",
      "CODE128A",
      "CODE128B",
      "CODE128C",
      "EAN13",
      "EAN8",
      "EAN5",
      "EAN2",
      "UPC",
      "UPCE",
      "ITF14",
      "ITF",
      "MSI",
      "MSI10",
      "MSI11",
      "MSI1010",
      "MSI1110",
      "pharmacode",
      "codabar",
      "GenericBarcode",
    ];

    const formatMatches = codeformat.map((format) => {
      const normalizedFormat = format.toUpperCase();
      const normalizedInput = (editedCard as Card).codeType
        .replace(/_/g, "")
        .toUpperCase();

      // Calculate similarity using Levenshtein distance
      function levenshteinDistance(a: string, b: string) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        for (let i = 0; i <= b.length; i++) {
          matrix[i] = [i];
        }

        for (let j = 0; j <= a.length; j++) {
          matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
            }
          }
        }

        return matrix[b.length][a.length];
      }

      // Calculate similarity percentage
      const maxLength = Math.max(
        normalizedFormat.length,
        normalizedInput.length
      );
      const distance = levenshteinDistance(normalizedFormat, normalizedInput);
      const similarity = ((maxLength - distance) / maxLength) * 100;

      return {
        format,
        similarity,
      };
    });

    // Sort by similarity and filter those above 70%
    const sortedMatches = formatMatches
      .sort((a, b) => b.similarity - a.similarity)
      .filter((match) => match.similarity >= 70);

    const matchingFormats = sortedMatches.map((match) => match.format);
    const bestMatch = sortedMatches.length > 0 ? sortedMatches[0].format : null;

    const matchPercentage =
      sortedMatches.length > 0 ? sortedMatches[0].similarity : 0;

    console.log(`Matching formats:`, matchingFormats);
    console.log(`Match percentage: ${matchPercentage.toFixed(2)}%`);
    console.log(`Best match: ${bestMatch}`);
    console.log(editedCard.codeType);

    // If card number is not provided, return no code
    if (!bestMatch) return nocode;

    return (
      <Barcode
        value={editedCard.cardNumber}
        format={
          bestMatch as
            | "CODE39"
            | "CODE128"
            | "CODE128A"
            | "CODE128B"
            | "CODE128C"
            | "EAN13"
            | "EAN8"
            | "EAN5"
            | "EAN2"
            | "UPC"
            | "UPCE"
            | "ITF14"
            | "ITF"
            | "MSI"
            | "MSI10"
            | "MSI11"
            | "MSI1010"
            | "MSI1110"
            | "pharmacode"
            | "codabar"
            | "GenericBarcode"
        }
      />
    );
  };

  const editCode = (
    <div className="flex flex-col items-center">
      <div className="flex justify-center items-center mb-6 border-b border-slate-200 ">
        <input
          type="text"
          className="text-center outline-none italic not-dark:text-gray-400 px-2 py-1"
          value={editedCard.cardNumber}
          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
          placeholder="Card Number"
        />
        <div className="relative">
          <button
            className=" p-1 hover:bg-slate-50 transition-colors relative"
            onClick={handleScanOptions}
            disabled={isLoading}
          >
            {isLoading ? (
              <AiOutlineLoading3Quarters className="h-6 w-6 text-gray-500 animate-spin" />
            ) : (
              // <CiCirclePlus className="h-6 w-6 text-gray-500" />
              <CiCamera className="h-6 w-6 not-dark:text-gray-500" />
            )}
          </button>
          <div
            ref={scanMenu}
            className="absolute origin-top-right z-10 mt-2 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabIndex={-1}
            onBlur={() => scanMenu.current?.classList.add("hidden")}
          >
            <div className="py-1" role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex items-center w-full px-4 py-2 text-sm not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
                onClick={() => {
                  scanMenu.current?.classList.add("hidden");
                  openPhotoLibrary();
                }}
              >
                <p>Import from Photo</p>
                <CiImageOn className="h-6 w-6 ml-auto" />
              </button>
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex items-center w-full px-4 py-2 text-sm not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
                onClick={() => setShowScan(true)}
              >
                <p>Scan with Camera</p>
                <CiBarcode className="h-6 w-6 ml-auto" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center rounded-4xl not-dark:bg-gray-200 dark:bg-gray-600 px-4 py-2">
        <select
          className="text-center outline-none"
          value={editedCard.codeType}
          onChange={(e) => handleInputChange("codeType", e.target.value)}
        >
          <option value="">Choose code type</option>
          {Object.keys(Html5QrcodeSupportedFormats)
            .filter((value) => value != "" && isNaN(Number(value)))
            .map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
        </select>
      </div>
    </div>
  );

  if (showScan) return <Scanner close={handleScannerResult} />;

  return (
    <div className="flex flex-col h-full w-full p-6">
      <div className="flex justify-between items-center">
        {/* Close Button */}
        <button onClick={handleClose}>
          <IoCloseOutline className="size-6 not-dark:text-gray-600" />
        </button>
        {/* Edit / Confirm button */}
        <button onClick={isEditing ? handleSave : () => setIsEditing(true)}>
          {isEditing ? (
            <IoCheckmark className="h-5 w-5 not-dark:text-gray-600" />
          ) : (
            <FiEdit3 className="h-5 w-5 not-dark:text-gray-600" />
          )}
        </button>
      </div>

      {/* Store Name */}
      <div className="flex justify-center items-center mt-12">
        <input
          type="text"
          className={`text-xl font-semibold text-center outline-none capitalize ${
            isEditing
              ? "border-b not-dark:border-slate-200 italic not-dark:text-gray-400"
              : "not-dark:text-gray-800"
          }`}
          value={editedCard.storeName}
          onChange={(e) => handleInputChange("storeName", e.target.value)}
          placeholder="Store Name"
          readOnly={!isEditing}
        />
      </div>

      {/* Barcode */}
      <div className="flex flex-col flex-1 justify-center items-center">
        {isEditing ? editCode : code()}
        <button
          onClick={handleDeleteCard}
          className="rounded-4xl p-4 mt-14 bg-red-300"
          disabled={!card.hasOwnProperty("cardNumber")}
        >
          <CiTrash className="size-6 not-dark:text-gray-800 dark:text-black" />
        </button>
      </div>

      {/* Notes */}
      <div className="flex justify-center items-center mb-12">
        <input
          type="text"
          className={`text-center outline-none ${
            isEditing
              ? "border-b not-dark:border-slate-200 italic not-dark:text-gray-400"
              : "not-dark:text-gray-600"
          }`}
          value={editedCard.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          readOnly={!isEditing}
          placeholder="Notes"
        />
      </div>
      <div id="scan-element" className="hidden"></div>
    </div>
  );
}
