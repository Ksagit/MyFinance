import { useState } from "react";
import appLogo from "/favicon.svg";
import { PWABadge } from "./PWABadge";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-8 bg-cyan-800 text-white font-sans">
      <div className="flex justify-center items-center mb-8">
        <a
          href="https://vite.dev"
          target="_blank"
          className="transition-all duration-300"
        >
          <img
            src={appLogo}
            className="will-change-filter transition-filter duration-300"
            alt="my_finance logo"
          />
        </a>
      </div>
      <h1 className="text-5xl font-bold mb-4">my_finance</h1>
      <div className="p-8 bg-gray-900/50 rounded-lg shadow-lg">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors duration-200"
        >
          count is {count}
        </button>
      </div>
      <p className="read-the-docs text-gray-200 mt-4">
        Click on the Vite and React logos to learn more
      </p>
      <PWABadge />
    </div>
  );
}
