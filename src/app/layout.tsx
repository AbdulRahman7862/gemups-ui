"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Providers from "@/store/Providers";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";


const inter = Inter({ subsets: ["latin"] });

// Dynamically import AuthInitializer with no SSR
const AuthInitializer = dynamic(() => import("@/components/common/AuthInitializer"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dark:bg-[#030507]`}>
        <Providers>
          <AuthInitializer>
            <ToastContainer position="top-right" autoClose={3000} />
            <ThemeProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </ThemeProvider>
          </AuthInitializer>
        </Providers>
      </body>
    </html>
  );
}
