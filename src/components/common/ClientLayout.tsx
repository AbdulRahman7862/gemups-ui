"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Providers from "@/store/Providers";
import { ToastContainer } from "react-toastify";
import dynamic from "next/dynamic";
import HydrationBoundary from "./HydrationBoundary";
import "react-toastify/dist/ReactToastify.css";

// Dynamically import AuthInitializer with no SSR
const AuthInitializer = dynamic(() => import("@/components/common/AuthInitializer"), {
  ssr: false,
});

// Dynamically import GuestUserInitializer with no SSR
const GuestUserInitializer = dynamic(() => import("@/components/common/GuestUserInitializer").then(mod => ({ default: mod.GuestUserInitializer })), {
  ssr: false,
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <HydrationBoundary>
      <Providers>
        <AuthInitializer>
          <GuestUserInitializer>
            <ToastContainer position="top-right" autoClose={3000} />
            <ThemeProvider>
              <SidebarProvider>
                {children}
              </SidebarProvider>
            </ThemeProvider>
          </GuestUserInitializer>
        </AuthInitializer>
      </Providers>
    </HydrationBoundary>
  );
} 