"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, StorageService } from "@/app/lib/storage-services";
import Scanner from "@/app/sections/Scanner";
import BwipJs from "bwip-js/browser"; // https://www.npmjs.com/package/bwip-js
import { IoCheckmark, IoChevronBack } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { CiBarcode, CiImageOn, CiTrash, CiEdit } from "react-icons/ci";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { IoIosArrowBack } from "react-icons/io";
import Navbar from "../components/Navbar";

function generateCardObject(): Card {
  return {
    storeName: "",
    cardNumber: "",
    codeType: "",
    notes: "",
  };
}

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
  const [showScan, setShowScan] = useState(false);
  const [editedCard, setEditedCard] = useState<Card | Partial<Card>>({
    ...generateCardObject(),
    ...card,
  });
  const [isManualInsert, setIsManualInsert] = useState(false);
  const db = useRef<StorageService>(null);
  const html5QrCode = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    db.current = new StorageService();
    html5QrCode.current = new Html5Qrcode("scan-element", true);
  }, []);

  console.log("Card: ", card);

  const handleScannerResult = (decodedText: string, format: string) => {
    handleInputChange("cardNumber", decodedText);
    handleInputChange("codeType", format);
    setShowScan(false);
    setIsManualInsert(true);
  };

  async function openPhotoLibrary() {
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
        });
    };

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

    console.log("card", card);
    console.log("editedCard", editedCard);

    if (card.cardNumber) {
      console.log("Updating card", card);
    } else {
      console.log("Adding new card", card);
    }

    await db.current!.setCard(editedCard as Card);

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
      try {
        await db.current!.deleteCard(editedCard as Card);
        alert("Card deleted successfully");
      } catch (error) {
        console.error("Failed to delete card:", error);
      }
      close();
    }
  };

  function handleInputChange(field: string, value: string | number) {
    setEditedCard((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const nocode = (
    <div className="text-center not-dark:text-gray-400">No code</div>
  );

  const code = () => {
    // If card number is not provided, return no code
    if (!editedCard.cardNumber || !editedCard.codeType) return nocode;

    const codeformat = editedCard.codeType
      .toLocaleLowerCase()
      .replace(/[_-]/g, "");

    console.log("Code format: ", codeformat);

    return (
      <div className="flex flex-col justify-center items-center max-w-full h-32">
        <canvas
          className="max-w-full h-32 bg-white p-2"
          ref={(canvas) => {
            if (!canvas) {
              return;
            }

            BwipJs.toCanvas(canvas, {
              bcid: codeformat, // Barcode type
              text: editedCard.cardNumber as string, // Text to encode
              scale: window.devicePixelRatio, // Scaling factor for high-DPI devices
              includetext: false, // Show human-readable text
            });
          }}
        />
        <div className="mt-4">{editedCard.cardNumber}</div>
      </div>
    );
  };

  const manualInput = (
    <>
      {/* Card Number input */}
      <input
        type="text"
        className="text-center outline-none italic not-dark:text-gray-400 border-b border-slate-200 px-2 py-1"
        value={editedCard.cardNumber}
        onChange={(e) => handleInputChange("cardNumber", e.target.value)}
        placeholder="Card Number"
      />

      {/* Code Type selection */}

      <div className="flex items-center w-full px-6 py-4 rounded-4xl dark:bg-gray-800 bg-blue-100 not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900">
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

      {/* Back to choices */}
      <button
        className="flex items-center w-full px-6 py-4 rounded-4xl dark:bg-gray-800 bg-gray-200 not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
        onClick={() => setIsManualInsert(false)}
      >
        <IoIosArrowBack className="h-6 w-6" />
        <p className="m-auto">Back</p>
        <IoIosArrowBack className="h-6 w-6" style={{ visibility: "hidden" }} />
      </button>
    </>
  );

  const addCardMethods = (
    <>
      {/* Scan with Camera button */}
      <button
        className="flex items-center w-full px-6 py-4 rounded-md dark:bg-gray-600 bg-blue-100 not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900 shadow"
        onClick={() => setShowScan(true)}
      >
        <p className="mr-4">Scan with Camera</p>
        <CiBarcode className="h-6 w-6 ml-auto" />
      </button>

      {/* Import from Photo button */}
      <button
        className="flex items-center w-full px-6 py-4 rounded-md dark:bg-gray-600 bg-blue-100  not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900 shadow"
        onClick={openPhotoLibrary}
      >
        <p className="mr-4">Import from Photo</p>
        <CiImageOn className="h-6 w-6 ml-auto" />
      </button>

      {/* Add Manually */}
      <button
        className="flex items-center w-full px-6 py-4 rounded-md dark:bg-gray-600 bg-blue-100  not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900 shadow"
        onClick={() => setIsManualInsert(true)}
      >
        <p className="mr-4">Add Manually</p>
        <CiEdit className="h-6 w-6 ml-auto" />
      </button>
    </>
  );

  const editCode = (
    <div className="flex flex-col justify-center items-center space-y-6">
      {isManualInsert ? manualInput : addCardMethods}
    </div>
  );

  const navBarComponent = (
    <Navbar>
      {/* Back Button */}
      <button onClick={handleClose}>
        <IoChevronBack className="size-6 not-dark:text-gray-600" />
      </button>

      {/* Edit / Confirm button */}
      <button
        className="ml-auto"
        onClick={isEditing ? handleSave : () => setIsEditing(true)}
      >
        {isEditing ? (
          <IoCheckmark className="h-5 w-5 not-dark:text-gray-600" />
        ) : (
          <FiEdit3 className="h-5 w-5 not-dark:text-gray-600" />
        )}
      </button>
    </Navbar>
  );

  const cardComponent = (
    <div className="space-y-8 m-8 p-8 bg-white dark:bg-gray-700 rounded-lg not-dark:border border-slate-200 shadow-md">
      {/* Store Name */}
      <div className="flex justify-center items-center">
        <input
          type="text"
          placeholder="Store Name"
          readOnly={!isEditing}
          value={editedCard.storeName}
          onChange={(e) => handleInputChange("storeName", e.target.value)}
          className={`text-xl font-semibold text-center outline-none capitalize ${
            isEditing
              ? "border-b not-dark:border-slate-200 italic not-dark:text-gray-400"
              : "not-dark:text-gray-800"
          }`}
        />
      </div>

      {/* Barcode */}
      <div className="flex flex-col justify-center items-center">
        {isEditing ? editCode : code()}
      </div>

      {/* Notes */}
      <div className="flex justify-center items-center">
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
    </div>
  );

  const deleteButton = (
    <div className="w-full flex items-center justify-center mt-14">
      <button
        onClick={handleDeleteCard}
        className="w-fit rounded-4xl p-4 bg-red-300"
        disabled={!card.hasOwnProperty("cardNumber")}
      >
        <CiTrash className="size-8 text-gray-800 dark:text-black" />
      </button>
    </div>
  );

  if (showScan) return <Scanner close={handleScannerResult} />;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Nav Bar */}
      {navBarComponent}

      {/* Card */}
      {cardComponent}

      {/* Delete button */}
      {deleteButton}

      {/* Code Scanner */}
      <div id="scan-element" className="hidden"></div>
    </div>
  );
}
