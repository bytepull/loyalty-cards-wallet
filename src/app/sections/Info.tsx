import React, { useEffect, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import links from "@/app/lib/links";
import Navbar from "../components/Navbar";

function Info({
  setShowInfo,
}: {
  setShowInfo: (showInfo: boolean) => void;
}): React.JSX.Element {
  const [persistData, setPersistData] = useState(false);

  useEffect(() => {
    (async function () {
      setPersistData(await navigator.storage.persisted());
    })();
  }, []);

  return (
    <div className="flex flex-col w-full h-full">
      <Navbar>
        <h1 className="text-center text-2xl font-bold">Info</h1>
        <button onClick={() => setShowInfo(false)} className="ml-auto">
          <IoCloseOutline className="size-6 text-gray-600" />
        </button>
      </Navbar>

      <div className="m-8 space-y-8">
        <div className="flex items-center justify-center">
          <FaCircle
            className={`mr-4 ${
              persistData ? "text-green-600" : "text-red-600"
            }`}
          />
          Data Persistence Status
        </div>
        <p>
          Simple Loyalty Cards Wallet is a web application that allows you to
          manage your loyalty cards. You can add, edit, and delete cards, as
          well as search for cards.
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
    </div>
  );
}

export default Info;
