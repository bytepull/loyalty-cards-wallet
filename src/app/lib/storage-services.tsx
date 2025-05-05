import { openDB } from "idb";

const DB_NAME = "loyalty_cards_db";
const STORE_NAME = "cards";
const DB_VERSION = 1;

export type Card = {
  [index: string]: number | string | undefined;
  storeName: string;
  cardNumber: string;
  codeType: string;
  notes?: string;
};

export class StorageService {
  private readonly db;

  public constructor() {
    this.db = this.initDB();
    this.persistData();
  }

  private async persistData() {
    if (navigator.storage && navigator.storage.persist) {
      const result = await navigator.storage.persist();
      console.log(`Data persisted: ${result}`);
    }
  }

  private async initDB() {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create the object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "cardNumber",
          });
          // Create indexes for faster querying
          store.createIndex("storeName", "storeName");
        }
      },
    });
  }

  public async getCards(): Promise<Array<Card>> {
    const tx = (await this.db).transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const cards = await store.getAll();
    return cards || [];
  }

  public async getCardByNumber(cardNumber: string): Promise<Card | undefined> {
    const tx = (await this.db).transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const card = await store.get(cardNumber);
    return card;
  }

  public async saveCards(cards: Array<Card>): Promise<void> {
    const tx = (await this.db).transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear existing cards
    await store.clear();

    // Add all new cards
    for (const card of cards) {
      await store.add(card);
    }

    await tx.done;
  }

  /* Add or update a card onto the DB */
  public async updateCard(card: Card): Promise<void> {
    const tx = (await this.db).transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.put(card);
    await tx.done;
    alert("Card updated successfully");
  }

  public async addCard(card: Card): Promise<void> {
    if (card.cardNumber === "") {
      alert("Card number cannot be empty");
      console.error("Card number cannot be empty", card);
      return;
    }
    // Ensure unique ID
    if (await this.getCardByNumber(card.cardNumber)) {
      alert(
        `Card with number ${card.cardNumber} already exists. Please choose or scan a different number.`
      );
    } else {
      const tx = (await this.db).transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      await store.add(card);
      await tx.done;
      console.log("Card added successfully", card);
      alert("Card added successfully");
    }
  }

  /* Delete card from DB */
  public async deleteCard(cardNumber: string): Promise<void> {
    const tx = (await this.db).transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await store.delete(cardNumber);
    await tx.done;
  }

  public async clearDB(callbackFn?: () => void) {
    if (window.confirm("Are you sure you want to clear all cards?")) {
      const tx = (await this.db).transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      await store.clear();
      await tx.done;

      window.alert("All cards have been cleared");
      if (callbackFn) callbackFn();
    }
  }

  public async exportCards() {
    const cards = await this.getCards();
    const exportData = JSON.stringify(cards, null, 2);
    const fileName = `loyalty-cards-export-${
      new Date()
        .toISOString()
        .replaceAll(":", "-")
        .split("T")
        .join("_")
        .split(".")[0]
    }.json`;

    try {
      // Web browser implementation
      const blob = new Blob([exportData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error exporting cards:", error);
        window.alert("Failed to export cards: " + error.message);
      } else {
        console.error("Unknown error exporting cards:", error);
        window.alert("Failed to export cards");
      }
    }
  }

  public async importCards(file: Blob, callbackFn: (() => void) | undefined) {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const importedCards = JSON.parse(e.target?.result as string);

            // Validate that the imported data is an array
            if (!Array.isArray(importedCards)) {
              throw new Error(
                "Invalid import file format. Expected an array of cards."
              );
            }

            console.log("Imported cards:", importedCards);

            // Validate each card has required properties
            importedCards.forEach((card) => {
              if (
                !card.hasOwnProperty("storeName") ||
                !card.storeName ||
                !card.hasOwnProperty("cardNumber") ||
                !card.cardNumber
              ) {
                throw new Error(
                  "Invalid card data. Each card must have a number and a store name."
                );
              }
            });

            // Check if there are existing cards
            const existingCards = await this.getCards();
            if (existingCards.length > 0) {
              // Ask user whether to merge or replace
              const userChoice = window.confirm(
                "You already have cards stored. Would you like to merge the imported cards with existing ones? Click 'OK' to merge, or 'Cancel' to replace all existing cards."
              );

              if (userChoice) {
                // Merge: Add new cards while keeping existing ones
                // Create a Set of existing IDs for faster lookup
                const existingIds = new Set(
                  existingCards.map((card) => card.id)
                );
                // Filter out duplicates and add new cards
                const newCards = importedCards.filter(
                  (card) => !existingIds.has(card.id)
                );
                const mergedCards = [...existingCards, ...newCards];
                await this.saveCards(mergedCards);
                window.alert(
                  `Cards merged successfully! Added ${newCards.length} new cards.`
                );
              } else {
                // Replace: Overwrite all existing cards
                await this.saveCards(importedCards);
                window.alert(
                  `All cards replaced! New total: ${importedCards.length} cards.`
                );
              }
            } else {
              // No existing cards, just import
              await this.saveCards(importedCards);
              window.alert(
                `Cards imported successfully! Total: ${importedCards.length} cards.`
              );
            }

            if (callbackFn) callbackFn();
            resolve(importedCards);
          } catch (error) {
            if (error instanceof Error) {
              console.error("Error importing cards:", error);
              window.alert("Failed to import cards: " + error.message);
            } else {
              console.error("Unknown error importing cards:", error);
              window.alert("Failed to import cards");
            }
            reject(error);
          }
        };

        reader.onerror = () => {
          const error = new Error("Error reading file");
          window.alert("Failed to read import file");
          reject(error);
        };

        reader.readAsText(file);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error importing cards:", error);
        window.alert("Failed to import cards: " + error.message);
      } else {
        console.error("Unknown error importing cards:", error);
        window.alert("Failed to import cards");
      }
      throw error;
    }
  }
}
