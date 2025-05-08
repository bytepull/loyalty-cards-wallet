"use client";

import React, { useState } from "react";
import { CiCircleInfo, CiExport, CiImport, CiTrash } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";

export interface SideMenuProps {
  states: {
    stateOfMenu: boolean;
  };
  actions: {
    openInfoSection: () => void;
    closeMenu: () => void;
    handleImport: () => void;
    handleExport: () => void;
    handleDeleteAllCards: () => void;
  };
}

function SideMenu({ actions, states }: SideMenuProps): React.JSX.Element {
  const [offset, setOffset] = useState(0);
  const [changeOffset, setChangeOffset] = useState(0);

  const menuButtonsCSSClass = "flex items-center w-full px-8 py-4 text-sm";

  return (
    <div
      onTouchStart={({ touches }) => {
        console.log("Start", touches[0].clientX);
        setOffset(touches[0].clientX);
      }}
      onTouchMove={({ touches }) => {
        // console.log(touches[0].clientX);
        setChangeOffset(offset - touches[0].clientX);
      }}
      onTouchEnd={() => {
        console.log("End", changeOffset);
        if (changeOffset > 50) {
          actions.closeMenu();
        }
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
      tabIndex={-1}
      className={`fixed top-0 letf-0 flex h-screen flex-col justify-between border-e border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-800 transition-transform duration-1000 transform ${
        states.stateOfMenu ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="py-6 space-y-8">
        <div className="flex space-x-4 text-xl p-4 m-4 border-b-2 border-gray-200 dark:border-gray-50/40">
          {/* TODO: Logo */}
          <h1>Loyalty Wallet</h1>
          <button>
            <IoCloseOutline
              className="absolute top-0 left-0 h-6 w-6 m-4 cursor-pointer"
              onClick={actions.closeMenu}
            />
          </button>
        </div>

        <div className="">
          <button
            type="button"
            role="menuitem"
            className={menuButtonsCSSClass}
            onClick={actions.openInfoSection}
          >
            <CiCircleInfo className="h-6 w-6 mr-4" />
            <p>Info</p>
          </button>
          <button
            type="button"
            className={menuButtonsCSSClass}
            onClick={actions.handleImport}
          >
            <CiImport className="h-6 w-6 mr-4" />
            <p>Import</p>
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuButtonsCSSClass}
            onClick={actions.handleExport}
          >
            <CiExport className="h-6 w-6 mr-4" />
            <p>Export</p>
          </button>
          <button
            type="button"
            className={menuButtonsCSSClass}
            onClick={actions.handleDeleteAllCards}
          >
            <CiTrash className="h-6 w-6 mr-4" />
            <p>Delete All Cards</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
