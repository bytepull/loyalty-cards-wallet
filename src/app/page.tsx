"use client";

import React, { useState, useEffect, useRef } from "react";
import CardList from "@/app/sections/CardList";
import CardDisplay from "@/app/sections/CardDisplay";
import InstallPrompt from "@/app/sections/InstallPrompt";
import { Card, StorageService } from "@/app/lib/storage-services";
import { CiMenuBurger } from "react-icons/ci";
import { FiPlus } from "react-icons/fi";
import { MdOutlineSortByAlpha } from "react-icons/md";
import { BsSortAlphaDown, BsSortAlphaUp } from "react-icons/bs";
import { IoCloseOutline, IoSearchOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import SideMenu, { SideMenuProps } from "./sections/SideMenu";
import Info from "./sections/Info";
import Navbar from "./components/Navbar";

const defaultSortingIcon = <MdOutlineSortByAlpha className="h-6 w-6" />;

export default function App() {
  const [cards, setCards] = useState<Array<Card>>([]);
  const [bkCards, setBkCards] = useState<Array<Card>>([]);
  const [showCard, setShowCard] = useState<Card | Partial<Card> | null>(null);
  const [sorting, setSorting] = useState(0);
  const [sortingIcon, setSortingIcon] = useState(defaultSortingIcon);
  const [showInfo, setShowInfo] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const serchBarElement = useRef<HTMLInputElement>(null);
  const db = useRef<StorageService>(null);

  useEffect(() => {
    db.current = new StorageService();
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

  const handleOpenInfo = () => {
    setIsSideMenuOpen(false);
    setShowInfo(true);
  };

  const handleImport = async () => {
    setIsSideMenuOpen(false);

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

  const handleExport = async () => {
    setIsSideMenuOpen(false);

    if (cards.length === 0) {
      window.alert("There are no cards to export.");
      return;
    }

    if (window.confirm("Are you sure you want to export all cards?")) {
      await db.current!.exportCards();
    }
  };

  const handleDeleteAllCards = () => {
    if (!window.confirm("Are you sure you want to delete all cards?")) {
      return;
    }
    setIsSideMenuOpen(false);
    db.current!.clearDB(() => {
      getCards();
    });
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

  const sideMenuProps: SideMenuProps = {
    states: {
      stateOfMenu: isSideMenuOpen,
    },
    actions: {
      closeMenu: () => setIsSideMenuOpen(false),
      openInfoSection: handleOpenInfo,
      handleImport: handleImport,
      handleExport: handleExport,
      handleDeleteAllCards: handleDeleteAllCards,
    },
  };

  const loadingComponent = (
    <div className="flex w-full h-full items-center justify-center">
      <AiOutlineLoading3Quarters className="h-28 w-28 animate-spin" />
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
        {searchQuery.length > 0 ? <IoCloseOutline className="h-5 w-5" /> : null}
      </button>
    </div>
  );

  const main = (
    <>
      <InstallPrompt />
      <SideMenu actions={sideMenuProps.actions} states={sideMenuProps.states} />
      <div className="flex flex-col w-full h-full dark:bg-gray-800">
        {/* Menu bar */}
        <Navbar>
          {/* Settings */}
          {/* https://tailwindccom/plus/ui-blocks/application-ui/elements/dropdowns */}
          <div className="flex">
            <button
              type="button"
              className="mr-auto"
              onClick={() => setIsSideMenuOpen(true)}
            >
              <CiMenuBurger className="h-6 w-6" />
            </button>
          </div>

          {/* Search bar */}
          {searchBar}

          {/* Sort */}
          <button onClick={handleSortCards}>{sortingIcon}</button>

          {/* Add cards */}
          <div className="" onClick={() => setShowCard({})}>
            <FiPlus className="h-6 w-6" />
          </div>
        </Navbar>

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

  if (showInfo) return <Info setShowInfo={setShowInfo} />;

  if (showCard) {
    return <CardDisplay card={showCard} close={handleDisplayCardClose} />;
  }

  return main;
}
