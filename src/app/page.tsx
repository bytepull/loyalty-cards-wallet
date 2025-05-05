"use client";

import React, { useState, useEffect, useRef } from "react";
import CardList from "@/app/ui/CardList";
import CardDisplay from "@/app/ui/CardDisplay";
import { Card, StorageService } from "@/app/lib/storage-services";
import {
  CiCircleInfo,
  CiExport,
  CiImport,
  CiSearch,
  CiTrash,
  CiSettings,
} from "react-icons/ci";
import { FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdOutlineSortByAlpha } from "react-icons/md";
import { BsSortAlphaDown, BsSortAlphaUp } from "react-icons/bs";
import { IoCloseOutline } from "react-icons/io5";
import links from "@/app/lib/links";

const defaultSortingIcon = <MdOutlineSortByAlpha className="h-6 w-6" />;

export default function App() {
  const [cards, setCards] = useState<Array<Card>>([]);
  const [bkCards, setBkCards] = useState<Array<Card>>([]);
  const [showCard, setShowCard] = useState<Card | Partial<Card> | null>(null);
  const [sorting, setSorting] = useState(0);
  const [sortingIcon, setSortingIcon] = useState(defaultSortingIcon);
  const [showInfo, setShowInfo] = useState(false);
  const [persistData, setPersistData] = useState(false);
  const db = useRef<StorageService>(null);

  useEffect(() => {
    db.current = new StorageService();
    (async function () {
      setPersistData(await navigator.storage.persisted());
    })();
  });

  useEffect(() => {
    getCards();
  }, [showCard]);

  const getCards = async () => {
    const cards: Array<Card> = await db.current!.getCards();
    setCards(cards);
    setBkCards(cards);
    console.log(cards);
  };

  const handleFileImport = async () => {
    // Create file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    // Trigger file selection dialog
    input.click();

    // Handle file selection
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          db.current!.importCards(file, () => {
            getCards();
          });
        } catch (error) {
          console.error("Import failed:", error);
          alert("Failed to import cards. Please check the file format.");
        }
      }
    };
  };

  const sortCards = () => {
    const newSorting = (sorting + 1) % 3;
    console.log(newSorting);

    switch (newSorting) {
      // Ascending order
      case 1:
        setCards((prev) =>
          [...prev].sort((card1: Card, card2: Card) =>
            card1.storeName.localeCompare(card2.storeName)
          )
        );
        setSortingIcon(<BsSortAlphaUp className="h-6 w-6" />);
        break;
      // Descending order
      case 2:
        setCards((prev) =>
          [...prev].sort((card1: Card, card2: Card) =>
            card2.storeName.localeCompare(card1.storeName)
          )
        );
        setSortingIcon(<BsSortAlphaDown className="h-6 w-6" />);
        break;
      default:
        setCards(bkCards);
        setSortingIcon(defaultSortingIcon);
        break;
    }
    setSorting(newSorting);
  };

  const searchCards = (query: string) => {
    const filteredCards = bkCards.filter((card: Card) =>
      card.storeName.toLowerCase().includes(query.toLowerCase())
    );
    setCards(filteredCards);
  };

  const info = (
    <div className="flex flex-col w-full h-full p-7 text-justify space-y-4">
      <div className="mb-6 flex items-center justify-between">
        <div className=""></div>
        <h1 className="text-2xl font-bold">Info</h1>
        <button onClick={() => setShowInfo(false)}>
          <IoCloseOutline className="size-6 text-gray-600" />
        </button>
      </div>
      <div className="flex items-center mb-4">
        <FaCircle
          className={`mr-4 ${persistData ? "text-green-600" : "text-red-600"}`}
        />
        Data Persistence Status
      </div>
      <p>
        Simple Loyalty Cards Wallet is a web application that allows you to
        manage your loyalty cards. You can add, edit, and delete cards, as well
        as search for cards.
      </p>
      <p>
        The application is built using{" "}
        <a
          href="https://nextjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Next.js
        </a>
        ,{" "}
        <a
          href="https://tailwindcss.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Tailwind CSS
        </a>
        , and{" "}
        <a
          href="https://react.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          React
        </a>
        , and uses IndexedDB to store your cards.
      </p>
      <p>
        The application is open source, and you can find the source code on{" "}
        <a
          href={links.repository}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          GitHub
        </a>
        .
      </p>
      <p>
        The application is licensed under the{" "}
        <a
          href={links.license}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          MIT License
        </a>
        .
      </p>
      <p>
        The application is created by{" "}
        <a
          href={links.author}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          @bytepull
        </a>
        .
      </p>
    </div>
  );

  const main = (
    <div className="flex flex-col w-full h-full">
      {/* Menu bar */}
      <nav className="flex w-full p-3 mb-6">
        {/* Settings */}
        {/* https://tailwindccom/plus/ui-blocks/application-ui/elements/dropdowns */}
        <div className="mr-auto relative">
          <button
            type="button"
            className="mr-auto relative"
            onClick={() => {
              document
                .getElementById("settings-menu")!
                .classList.toggle("hidden");
            }}
          >
            <CiSettings className="h-6 w-6" />
          </button>
          <div
            id="settings-menu"
            className="absolute left-0 origin-top-left z-10 mt-2 w-56 divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabIndex={-1}
            onBlur={() =>
              document.getElementById("settings-menu")!.classList.add("hidden")
            }
          >
            <div className="py-1" role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-slate-200 hover:text-gray-900"
                onClick={() => setShowInfo(true)}
              >
                <p>Info</p>
                <CiCircleInfo className="h-6 w-6 ml-auto" />
              </button>
            </div>
            <div className="py-1" role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-slate-200 hover:text-gray-900"
                onClick={() => {
                  handleFileImport();
                  document
                    .getElementById("settings-menu")!
                    .classList.toggle("hidden");
                }}
              >
                <p>Import</p>
                <CiImport className="h-6 w-6 ml-auto" />
              </button>
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-slate-200 hover:text-gray-900"
                onClick={() => {
                  db.current!.exportCards(() => {
                    document
                      .getElementById("settings-menu")!
                      .classList.toggle("hidden");
                  });
                }}
              >
                <p>Export</p>
                <CiExport className="h-6 w-6 ml-auto" />
              </button>
            </div>
            <div className="py-1" role="none">
              <button
                type="button"
                role="menuitem"
                tabIndex={-1}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-slate-200 hover:text-gray-900"
                onClick={() =>
                  db.current!.clearDB(() => {
                    getCards();
                    document
                      .getElementById("settings-menu")!
                      .classList.toggle("hidden");
                  })
                }
              >
                <p>Delete All Cards</p>
                <CiTrash className="h-6 w-6 ml-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Sort */}
        <button onClick={sortCards}>{sortingIcon}</button>

        {/* Add cards */}
        <div className="ml-6" onClick={() => setShowCard({})}>
          <FiPlus className="h-6 w-6" />
        </div>
      </nav>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-6">
        Simple Loyalty Cards Wallet
      </h1>

      {/* Search bar */}
      <div className="w-full mb-6">
        <div className="relative w-full px-4">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-4 pr-10 py-2 border rounded-lg focus:outline-none focus:border-blue-500 bg-gray-200 text-gray-600 placeholder:text-gray-600"
              placeholder="Search cards..."
              onChange={(e) => searchCards(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CiSearch className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      {/* Cards */}
      <div className="flex-1 overflow-auto p-4">
        <CardList cards={cards} showCard={setShowCard} />
      </div>
    </div>
  );

  if (showInfo) return info;

  if (showCard) {
    return <CardDisplay card={showCard} close={() => setShowCard(null)} />;
  } else {
    return main;
  }
}
