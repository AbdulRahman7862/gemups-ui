import GridShape from "@/components/common/GridShape";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-[#030507] sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-[#030507] sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                  <Image
                    width={251}
                    height={50}
                    src="/images/logo/logoNew.svg"
                    alt="Logo"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
