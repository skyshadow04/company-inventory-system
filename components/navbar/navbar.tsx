"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [currentHash, setCurrentHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash : "",
  );
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isDashboardPage = pathname?.startsWith("/inventoryDashboard");
  const isHomePage = pathname === "/";
  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });

      if (res.ok) {
        toast.success("Logged out");
        setTimeout(() => {
          window.location.href = "/";
        }, 700);
        return;
      }

      toast.error("Logout failed");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  function handleNavClick(e: React.MouseEvent, id: string) {
    e.preventDefault();

    const targetHash = `#${id}`;

    // Always open the homepage for section links, even if the user is logged in on the dashboard.
    if (pathname === "/" || pathname === "") {
      const el = document.getElementById(id);
      window.location.hash = targetHash;

      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    router.push(`/#${id}`);
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadPendingAuth() {
      if (typeof window !== "undefined") {
        const pending = window.sessionStorage.getItem("authPending") === "true";
        setAuthPending(pending);
      }
    }

    async function check() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET", credentials: "include" });
        const data = await res.json();
        if (!mounted) return;
        const authenticated = Boolean(data?.authenticated);
        setIsAuthenticated(authenticated);
        if (authenticated && data?.user) {
          setUser({ id: data.user.id, name: data.user.name });
        } else {
          setUser(null);
        }
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("authPending");
          setAuthPending(false);
        }
      } catch {
        if (!mounted) return;
        setIsAuthenticated(false);
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("authPending");
          setAuthPending(false);
        }
      }
    }

    loadPendingAuth();
    check();

    return () => {
      mounted = false;
    };
  }, []);

  // Show the navbar once auth status has been resolved; keep a skeleton while loading.
  if (isAuthenticated === null || authPending) {
    return (
      <header className="sticky top-0 z-50 border-b bg-white/95 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-200 rounded" />
            <div className="hidden sm:block">
              <div className="h-4 w-48 bg-slate-200 rounded mt-1" />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="h-4 w-12 bg-slate-200 rounded" />
            <div className="h-4 w-12 bg-slate-200 rounded" />
            <div className="h-4 w-12 bg-slate-200 rounded" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden shadow-sm sm:h-11 sm:w-11">
            <Image
              src="/images/icon.ico"
              alt="Company icon"
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </div>

          <h1 className="hidden text-lg font-bold text-sky-700 sm:block font-mono">
            Leadership Domestic Workers Service Center
          </h1>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/#home"
            onClick={(e) => handleNavClick(e, "home")}
            className={`rounded-md p-2 font-mono text-sm font-medium transition ${
              isHomePage
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/#about"
            onClick={(e) => handleNavClick(e, "about")}
            className={`rounded-md p-2 font-mono text-sm font-medium transition ${
              isHomePage && currentHash === "#about"
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            About
          </Link>
          <Link
            href="/#services"
            onClick={(e) => handleNavClick(e, "services")}
            className={`rounded-md p-2 font-mono text-sm font-medium transition ${
              isHomePage && currentHash === "#services"
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            Services
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className={`rounded-md p-2 font-mono text-sm font-medium transition ${
              isHomePage && currentHash === "#contact"
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              {!isDashboardPage && (
                <Link href="/inventoryDashboard" className="rounded-md p-2 font-mono text-sm font-medium text-sky-700 transition hover:bg-sky-950 hover:text-white">
                  Dashboard
                </Link>
              )}
              {user && (
                <Link href="/inventoryDashboard/profile" className="pr-2 font-mono text-sm font-medium text-sky-700 transition hover:underline">
                  Hi, {user.name}
                </Link>
              )}
              <button onClick={handleLogout} className="rounded-md p-2 font-mono text-sm font-medium text-sky-700 transition hover:bg-sky-950 hover:text-white">
                Logout
              </button>
            </>
          ) : !isLoginPage ? (
            <Link href="/login" className="rounded-md p-2 font-mono text-sm font-medium text-sky-700 transition hover:bg-sky-950 hover:text-white">
              Login
            </Link>
          ) : null}
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
          <Link
            href="/#home"
            onClick={(e) => handleNavClick(e, "home")}
            className={`rounded-md px-2 py-2 text-sm font-medium font-mono transition ${
              isHomePage
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href="/#about"
            onClick={(e) => handleNavClick(e, "about")}
            className={`rounded-md px-2 py-2 text-sm font-medium font-mono transition ${
              isHomePage && currentHash === "#about"
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            About
          </Link>
          <Link
            href="/#services"
            onClick={(e) => handleNavClick(e, "services")}
            className={`rounded-md px-2 py-2 text-sm font-medium font-mono transition ${
              isHomePage && currentHash === "#services"
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            Services
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className={`rounded-md px-2 py-2 text-sm font-medium font-mono transition ${
              isHomePage && currentHash === "#contact"
                ? "bg-sky-700 text-white"
                : "text-sky-700 hover:bg-sky-950 hover:text-white"
            }`}
          >
            Contact
          </Link>
          {/* <a href="#information" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
          </a> */}
          {isAuthenticated ? (
            <>
              {!isDashboardPage && (
                <Link href="/inventoryDashboard" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 transition hover:bg-sky-950 hover:text-white">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 transition hover:bg-sky-950 hover:text-white">
                Logout
              </button>
            </>
          ) : !isLoginPage ? (
            <Link href="/login" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 transition hover:bg-sky-950 hover:text-white">
              Login
            </Link>
          ) : null}
          {/* <a href="#" className="rounded-md px-2 py-2 text-sm font-medium font-mono text-sky-700 hover:bg-sky-950 hover:text-white">
            Register
          </a> */}
        </div>
      )}
    </header>
  );
}