"use client";

import { useEffect, useState } from "react";

interface BrowserExtensionWrapperProps {
  children: React.ReactNode;
}

export default function BrowserExtensionWrapper({ children }: BrowserExtensionWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // On the server, render children immediately
  // On the client, wait for hydration to complete
  if (!isClient) {
    return <>{children}</>;
  }

  return <>{children}</>;
} 