'use client';

import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden shadow-sm sm:h-11 sm:w-11">
            <img
              src="/images/icon.ico"
              alt="Company icon"
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="hidden text-lg font-bold text-sky-700 sm:block font-mono">
            Leadership Domestic Workers Service Center
          </h1>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <a href="#home" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            Home
          </a>
          <a href="#about" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            About
          </a>
          <a href="#services" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            Services
          </a>
          {/* <a href="#information" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            Information
            </a> */}
          <a href="#contact" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            Contact
          </a>
          <a href="/login" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            Login
          </a>
          {/* <a href="/register" className="text-sm font-medium text-sky-700 hover:text-white hover:bg-sky-950 font-mono p-2 rounded-md">
            Register
          </a> */}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-sky-200 text-sky-700 md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16h16" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-sky-100 bg-white p-3 shadow-sm md:hidden">
          <a href="#home" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            Home
          </a>
          <a href="#about" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            About
          </a>
          <a href="#services" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            Services
          </a>
          <a href="#contact" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            Contact
          </a>
          {/* <a href="#information" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
          </a> */}
          <a href="#" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            Login
          </a>
          {/* <a href="#" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            Register
          </a> */}
        </div>
      )}
    </header>
  );
}