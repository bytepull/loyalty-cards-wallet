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

  const menuButtonsCSSClass = "flex items-center w-full px-2 py-4 text-sm";

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
      className={`fixed top-0 letf-0 z-50 flex flex-col h-screen w-screen border-e border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-800 transition-transform duration-1000 transform ${
        states.stateOfMenu ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="w-full p-4">
        <button className="p-4">
          <IoCloseOutline
            className="h-8 w-8 cursor-pointer"
            onClick={actions.closeMenu}
          />
        </button>

        <div className="space-y-8">
          <div className="text-xl text-center font-bold pb-4 pt-2 mx-4 border-b-2 border-gray-200 dark:border-gray-50/40">
            {/* TODO: Logo */}
            <h1>Loyalty Wallet</h1>
          </div>

          <div className="px-4">
            <div className="text-lg font-bold mb-4">Management</div>
            <div className="divide-y divide-gray-200">
              <button
                type="button"
                className={menuButtonsCSSClass}
                onClick={actions.handleImport}
              >
                <CiImport className="h-6 w-6 mr-4" />
                <p>Import Cards</p>
              </button>
              <button
                type="button"
                role="menuitem"
                className={menuButtonsCSSClass}
                onClick={actions.handleExport}
              >
                <CiExport className="h-6 w-6 mr-4" />
                <p>Export Cards</p>
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

          <div className="px-4">
            <div className="text-lg font-bold mb-4">Help</div>
            <div className="divide-y divide-gray-200">
              <button
                type="button"
                role="menuitem"
                className={menuButtonsCSSClass}
                onClick={actions.openInfoSection}
              >
                <CiCircleInfo className="h-6 w-6 mr-4" />
                <p>Info</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
