"use client";
import CartDrawer from "@/components/common/Modals/CartDrawer";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useAppDispatch } from "@/store/hooks";
import { getUserBalance } from "@/store/user/actions";
import { getAuthToken } from "@/utils/authCookies";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useMemo } from "react";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated, isGuest } = useAuthStatus();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const pageTitle = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Home";

    const first = segments[0];

    return first.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }, [pathname]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    dispatch(getUserBalance());
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 dark:border-gray-800 dark:bg-[#030507] lg:border-b z-10">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6 lg:p-0 p-6">
        <div className="flex items-center justify-between w-full gap-2 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          <div className="hidden lg:flex items-center gap-3">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.67 13.13C18.04 14.06 19 15.32 19 17V20H23V17C23 14.82 19.43 13.53 16.67 13.13Z"
                fill="#13F195"
              />
              <path
                d="M15 12C17.21 12 19 10.21 19 8C19 5.79 17.21 4 15 4C14.53 4 14.09 4.1 13.67 4.24C14.5 5.27 15 6.58 15 8C15 9.42 14.5 10.73 13.67 11.76C14.09 11.9 14.53 12 15 12Z"
                fill="#13F195"
              />
              <path
                d="M9 12C11.21 12 13 10.21 13 8C13 5.79 11.21 4 9 4C6.79 4 5 5.79 5 8C5 10.21 6.79 12 9 12ZM9 6C10.1 6 11 6.9 11 8C11 9.1 10.1 10 9 10C7.9 10 7 9.1 7 8C7 6.9 7.9 6 9 6Z"
                fill="#13F195"
              />
              <path
                d="M9 13C6.33 13 1 14.34 1 17V20H17V17C17 14.34 11.67 13 9 13ZM15 18H3V17.01C3.2 16.29 6.3 15 9 15C11.7 15 14.8 16.29 15 17V18Z"
                fill="#13F195"
              />
            </svg>
            <span className="text-white text-[16px]">{pageTitle}</span>
          </div>
          <Link href="/" className="lg:hidden">
            <Image
              width={45}
              height={24}
              className="dark:hidden"
              src="/images/logo/Logo.svg"
              alt="Logo"
            />
            <Image
              width={45}
              height={24}
              className="hidden dark:block"
              src="/images/logo/Logo.svg"
              alt="Logo"
            />
          </Link>
          <div className="flex items-center gap-2">
          <div className="flex lg:hidden items-center">
            {(isAuthenticated || isGuest) && <UserDropdown />}
            {!isAuthenticated && !isGuest && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/signin")}
                  className="flex items-center text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-[#13F195] text-black"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="flex items-center text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-[#0f1720] text-white"
                >
                  Register
                </button>
              </div>
            )}
            <button
              className="relative dropdown-toggle flex items-center justify-center text-[#13F195] transition-colors bg-white border border-gray-200 rounded-lg hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-[#090E15] dark:text-[#13F195] dark:hover:bg-gray-800 dark:hover:text-[#13F195]"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <span
                className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
                  !isCartOpen ? "hidden" : "flex"
                }`}
              >
                <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
              </span>
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 18C5.895 18 5 18.895 5 20C5 21.105 5.895 22 7 22C8.105 22 9 21.105 9 20C9 18.895 8.105 18 7 18ZM1 2H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.105 5.895 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.65L8.1 13H14.55C15.3 13 15.96 12.59 16.3 11.97L20.88 3.97C21.11 3.55 20.8 3 20.31 3H5.21L4.27 1H1V2ZM17 18C15.895 18 15 18.895 15 20C15 21.105 15.895 22 17 22C18.105 22 19 21.105 19 20C19 18.895 18.105 18 17 18Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <button
            className="block lg:hidden items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="8" fill="#7BB9FF" fillOpacity="0.1" />
                <path
                  d="M11 26H29V24H11V26ZM11 21H29V19H11V21ZM11 14V16H29V14H11Z"
                  fill="white"
                />
              </svg>
            )}
          </button>
            </div>
        </div>
        <div
          className={`hidden lg:flex items-center justify-between w-full gap-4 px-5 py-4 shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-2 2xsm:gap-3">
            <div className="flex items-center gap-2 2xsm:gap-3 bg-[#090E15] px-4 py-2 rounded-full whitespace-nowrap hover:bg-[#1C2430] cursor-pointer">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#13F195" />
              </svg>
              <div className="text-white text-[16px]">Start to sell</div>
            </div>
            {(isAuthenticated || isGuest) && <UserDropdown />}
            {!isAuthenticated && !isGuest && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/signin")}
                  className="flex items-center px-4 py-2 rounded-lg bg-[#13F195] text-black text-base"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="flex items-center px-4 py-2 rounded-lg bg-[#0f1720] text-white text-base"
                >
                  Register
                </button>
              </div>
            )}
            <div className="relative">
              <button
                className="relative dropdown-toggle flex items-center justify-center text-[#13F195] transition-colors bg-white border border-gray-200 rounded-lg hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-[#090E15] dark:text-[#13F195] dark:hover:bg-gray-800 dark:hover:text-[#13F195]"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <span
                  className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
                    !isCartOpen ? "hidden" : "flex"
                  }`}
                >
                  <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
                </span>
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 18C5.895 18 5 18.895 5 20C5 21.105 5.895 22 7 22C8.105 22 9 21.105 9 20C9 18.895 8.105 18 7 18ZM1 2H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.105 5.895 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.65L8.1 13H14.55C15.3 13 15.96 12.59 16.3 11.97L20.88 3.97C21.11 3.55 20.8 3 20.31 3H5.21L4.27 1H1V2ZM17 18C15.895 18 15 18.895 15 20C15 21.105 15.895 22 17 22C18.105 22 19 21.105 19 20C19 18.895 18.105 18 17 18Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default AppHeader;
