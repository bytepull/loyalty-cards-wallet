import { openDB, IDBPDatabase, DBSchema } from "idb";

const DB_NAME = "loyalty_cards_db";
const STORE_NAME = "cards";
const DB_VERSION = 2; // Increment the version number

export interface Card {
  [index: string]: number | string | undefined;
  id?: string;
  storeName: string;
  cardNumber: string;
  codeType: string;
  notes?: string;
}

interface MyDatabase extends DBSchema {
  cards: {
    key: "id";
    autoIncrement: true;
    value: Card;
    indexes: {
      id: string;
      cardNumber: string;
      storeName: string;
    };
  };
}

const storeParams = {
  keyPath: "id",
  autoIncrement: true,
};

export class StorageService {
  private db: Promise<IDBPDatabase<MyDatabase>>;

  public constructor() {
    this.db = this.initDB();
    this.persistData();
  }

  private createStore(db: IDBPDatabase<MyDatabase>) {
    console.log("Creating store...");
    const store = db.createObjectStore(STORE_NAME, storeParams);
    console.log("Creating indexes...");
    store.createIndex("id", "id", { unique: true });
    store.createIndex("cardNumber", "cardNumber");
    store.createIndex("storeName", "storeName");
    return store;
  }

  private async initDB(): Promise<IDBPDatabase<MyDatabase>> {
    const db = await openDB<MyDatabase>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, newVersion, transaction) {
        if (oldVersion < 1 || !db.objectStoreNames.contains(STORE_NAME)) {
          // Create initial store if it doesn't exist
          console.log("Creating store...");
          const store = db.createObjectStore(STORE_NAME, storeParams);
          console.log("Creating indexes...");
          store.createIndex("id", "id", { unique: true });
          store.createIndex("cardNumber", "cardNumber");
          store.createIndex("storeName", "storeName");
        } else {
          console.log("Upgrading database...");
          // Handle upgrade logic
          console.log(`Store ${STORE_NAME} already exists. Upgrading...`);
          console.log("Saving data...");
          const data = await transaction.objectStore(STORE_NAME).getAll();
          console.log("Data saved successfully", data);
          console.log("Deleting existing store...");
          db.deleteObjectStore(STORE_NAME);
          console.log("Creating new store...");
          const newStore = db.createObjectStore(STORE_NAME, storeParams);
          console.log("Creating indexes...");
          newStore.createIndex("id", "id", { unique: true });
          newStore.createIndex("cardNumber", "cardNumber");
          newStore.createIndex("storeName", "storeName");
          console.log("Adding data back...");
          for (const item of data) {
            await newStore.add(item);
          }
          console.log("Data saved successfully");
        }
      },
      blocked() {
        console.log("Please close all other tabs with this site open!");
        alert("Please close all other tabs with this site open!");
      },
    });

    return db;
  }

  private async persistData() {
    if (navigator.storage && navigator.storage.persist) {
      const result = await navigator.storage.persist();
      console.log(`Data persisted: ${result}`);
    }
  }

  public async getCards(): Promise<Array<Card>> {
    const tx = (await this.db).transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const cards = await store.getAll();
    return cards || [];
  }

  public async getCardByNumber(cardNumber: string): Promise<Card | undefined> {
    const db = await this.db;
    const card = await db.getFromIndex(STORE_NAME, "cardNumber", cardNumber);
    return card;
  }

  public async getCardById(id: string): Promise<Card | undefined> {
    const db = await this.db;
    const card = db.getFromIndex(STORE_NAME, "id", id);
    console.log("card", card);
    return card;
  }

  public async saveCards(cards: Array<Card>): Promise<void> {
    const db = await this.db;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear existing cards
    await store.clear();

    // Add all new cards
    for (const card of cards) {
      console.log(card);
      await store.add(card);
    }
    await tx.done;
  }

  /* Add or update a card onto the DB */
  public async setCard(card: Card): Promise<void> {
    await (await this.db).put(STORE_NAME, card);
    console.log("Card updated successfully", card);
    alert("Card updated successfully");
  }

  /* Delete card from DB */
  public async deleteCard(card: Card): Promise<void> {
    console.log("deleteCard(card)", card);
    if (!card.id) {
      throw new Error("Card ID cannot be empty"); // Throw an error if card ID is empty
    }
    const db = await this.db;
    await db.delete(STORE_NAME, card.id as "id");
  }

  public async clearDB(callbackFn?: () => void) {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all cards?"
    );
    if (confirmClear) {
      const db = await this.db;
      await db.clear(STORE_NAME);
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

  public async importCards(file: Blob): Promise<Array<Card>> {
    return new Promise<Array<Card>>((resolve, reject) => {
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

          // No existing cards, just import
          await this.saveCards(importedCards);
          window.alert(
            `Cards imported successfully! Total: ${importedCards.length} cards.`
          );
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
  }
}
