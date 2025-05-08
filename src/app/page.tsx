"use client";

import React, { useState, useEffect, useRef } from "react";
import CardList from "@/app/ui/CardList";
import CardDisplay from "@/app/ui/CardDisplay";
import links from "@/app/lib/links";
import InstallPrompt from "@/app/ui/InstallPrompt";
import { Card, StorageService } from "@/app/lib/storage-services";
import {
  CiCircleInfo,
  CiExport,
  CiImport,
  CiTrash,
  CiMenuBurger,
} from "react-icons/ci";
import { FaCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { MdOutlineSortByAlpha } from "react-icons/md";
import { BsSortAlphaDown, BsSortAlphaUp } from "react-icons/bs";
import { IoCloseOutline, IoSearchOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const defaultSortingIcon = <MdOutlineSortByAlpha className="h-6 w-6" />;

export default function App() {
  const [cards, setCards] = useState<Array<Card>>([]);
  const [bkCards, setBkCards] = useState<Array<Card>>([]);
  const [showCard, setShowCard] = useState<Card | Partial<Card> | null>(null);
  const [sorting, setSorting] = useState(0);
  const [sortingIcon, setSortingIcon] = useState(defaultSortingIcon);
  const [showInfo, setShowInfo] = useState(false);
  const [persistData, setPersistData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const settingsMenuElement = useRef<HTMLDivElement>(null);
  const serchBarElement = useRef<HTMLInputElement>(null);
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
    setIsLoading(false);
    console.log(cards);
  };

  const handleFileImport = async () => {
    if (cards.length > 0) {
      if (
        !window.confirm(
          "There are cards stored already. Would you like to replace the existing ones?"
        )
      ) {
        return;
      }
    }
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
        db.current!.importCards(file).then(() => {
          getCards();
        });
      }
    };
  };

  const handleDisplayCardClose = () => {
    setShowCard(null);
    setSearchQuery("");
  };

  const handleSortCards = () => {
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

  const handleSearchCards = (query: string) => {
    setSearchQuery(query);
    if (query.length === 0) {
      setCards(bkCards);
      return;
    }
    const filteredCards = bkCards.filter((card: Card) =>
      card.storeName.toLowerCase().includes(query.toLowerCase())
    );
    setCards(filteredCards);
  };

  const loadingComponent = (
    <div className="flex w-full h-full items-center justify-center">
      <AiOutlineLoading3Quarters className="h-28 w-28 animate-spin" />
    </div>
  );

  const info = (
    <div className="flex flex-col w-full h-full p-7 text-center space-y-4">
      <div className="mb-6 flex items-center justify-end">
        <button onClick={() => setShowInfo(false)}>
          <IoCloseOutline className="size-6 text-gray-600" />
        </button>
      </div>
      <h1 className="text-center text-2xl font-bold">Info</h1>
      <div className="flex items-center justify-center mb-8">
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
      <h2 className="text-center text-xl font-bold my-4">Issues</h2>
      <p>Found a bug or have a suggestion? </p>
      <p>
        Please open a{" "}
        <a
          href={links.issue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          GitHub Issue
        </a>
        .
      </p>
    </div>
  );

  const searchBar = (
    <div className="flex space-x-2 w-full bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-50 rounded-4xl">
      <div className="px-3 py-2 rounded-4xl ">
        <IoSearchOutline className="h-5 w-5" />
      </div>
      <input
        ref={serchBarElement}
        type="text"
        className="w-full py-2 rounded-4xl focus:outline-none focus:border-blue-500  placeholder:text-gray-400"
        placeholder="Search"
        onChange={(e) => handleSearchCards(e.target.value)}
        value={searchQuery}
      />
      <button
        type="button"
        className="pr-3 rounded-4xl"
        onClick={() => {
          if (searchQuery.length > 0) handleSearchCards("");
        }}
      >
        {searchQuery.length > 0 ? (
          <IoCloseOutline className="h-5 w-5" />
        ) : null}
      </button>
    </div>
  );

  const main = (
    <>
      <InstallPrompt />
      <div className="flex flex-col w-full h-full dark:bg-gray-800">
        {/* Menu bar */}
        <nav className="flex items-center w-full p-6 mb-6 bg-white dark:bg-gray-900 shadow space-x-8">
          {/* Settings */}
          {/* https://tailwindccom/plus/ui-blocks/application-ui/elements/dropdowns */}
          <div className="relative flex">
            <button
              type="button"
              className="mr-auto"
              onClick={() => {
                settingsMenuElement.current?.classList.toggle("hidden");
              }}
            >
              <CiMenuBurger className="h-6 w-6" />
            </button>
            <div
              ref={settingsMenuElement}
              className="absolute left-0 origin-top-left z-10 mt-2 w-56 divide-y divide-gray-100 rounded-md bg-(--background) dark:bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-hidden hidden"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="py-1" role="none">
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className="flex items-center w-full px-4 py-2 text-sm not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
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
                  className="flex items-center w-full px-4 py-2 text-sm not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
                  onClick={() => {
                    handleFileImport();
                    settingsMenuElement.current?.classList.toggle("hidden");
                  }}
                >
                  <p>Import</p>
                  <CiImport className="h-6 w-6 ml-auto" />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className="flex items-center w-full px-4 py-2 text-sm not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
                  onClick={() => {
                    settingsMenuElement.current?.classList.toggle("hidden");
                    db.current!.exportCards();
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
                  className="flex items-center w-full px-4 py-2 text-sm not-dark:text-gray-700 not-dark:hover:bg-slate-200 not-dark:hover:text-gray-900"
                  onClick={() =>
                    db.current!.clearDB(() => {
                      getCards();
                      settingsMenuElement.current?.classList.toggle("hidden");
                    })
                  }
                >
                  <p>Delete All Cards</p>
                  <CiTrash className="h-6 w-6 ml-auto" />
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          {searchBar}

          {/* Sort */}
          <button onClick={handleSortCards}>{sortingIcon}</button>

          {/* Add cards */}
          <div className="" onClick={() => setShowCard({})}>
            <FiPlus className="h-6 w-6" />
          </div>
        </nav>

        {/* Title */}
        {/* <h1 className="text-2xl font-bold text-center mb-6">
          Simple Loyalty Cards Wallet
        </h1> */}

        {/* Cards */}
        <div className="text-center italic text-slate-400">
          {cards.length} cards
        </div>
        <div className="flex-1 overflow-auto m-8">
          {isLoading ? (
            loadingComponent
          ) : (
            <CardList cards={cards} showCard={setShowCard} />
          )}
        </div>
      </div>
    </>
  );

  if (showInfo) return info;

  if (showCard) {
    return <CardDisplay card={showCard} close={handleDisplayCardClose} />;
  }
    
  return main;
}
