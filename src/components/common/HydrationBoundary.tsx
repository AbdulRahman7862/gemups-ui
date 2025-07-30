"use client";

import { useEffect, useState } from "react";

interface HydrationBoundaryProps {
  children: React.ReactNode;
}

export default function HydrationBoundary({ children }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show a loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#030507] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#13F195]"></div>
      </div>
    );
  }

  return <>{children}</>;
} 