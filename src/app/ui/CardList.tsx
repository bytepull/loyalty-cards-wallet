"use client";

import React from "react";
import { Card } from "@/app/lib/storage-services";

export default function CardList({
  cards,
  showCard,
}: {
  cards: Array<Card>;
  showCard: (card: Card | null) => void;
}) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-semibold not-dark:text-gray-800 mb-4">
          No cards found
        </h2>
        <p className="not-dark:text-gray-600">Add a new card to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex w-full items-center justify-center h-20 p-3 dark:bg-gray-800 rounded-lg not-dark:border border-slate-200 shadow-md hover:shadow-lg transition-shadow "
          onClick={() => showCard(card)}
        >
          {/* <h2 className="w-full text-center text-xl font-semibold text-gray-800 capitalize"> */}
          <h2 className="w-full text-center sm:text-xl font-semibold not-dark:text-gray-800 capitalize">
            {card.storeName}
          </h2>
        </div>
      ))}
    </div>
  );
}
