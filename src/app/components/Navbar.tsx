import React from "react";

function Navbar({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <nav className="sticky flex items-center w-full p-6 mb-6 bg-white dark:bg-gray-900 shadow space-x-8">
      {children}
    </nav>
  );
}

export default Navbar;
