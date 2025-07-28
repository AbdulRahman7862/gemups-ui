import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface Seller {
  id: number;
  name: string;
  image: string;
}

interface OtherSellerProps {
  isOpen: boolean;
  onClose: () => void;
  otherSellers: Seller[];
  loading: boolean;
}

export default function OtherSellers({
  isOpen,
  onClose,
  otherSellers,
  loading,
}: OtherSellerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={drawerRef}
      className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#090E15] text-white shadow-lg transform transition-transform duration-300 z-[5000000] ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-[#1E2836]">
        <h2 className="text-2xl font-bold">
          Other Sellers <span className="text-[#7A8895]">({otherSellers?.length})</span>
        </h2>
        <button onClick={onClose}>
          <X className="text-white hover:text-red-400" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-[#7A8895]">Loading sellers...</p>
        ) : otherSellers.length === 0 ? (
          <p className="text-[#7A8895]">No other sellers</p>
        ) : (
          otherSellers.map((seller, idx) => (
            <div
              key={seller?.id ?? idx}
              className="flex items-center space-x-4 bg-[#0F141B] p-3 rounded-lg"
            >
              <div className="w-12 h-12 relative">
                {(seller?.image && seller.image !== "") ? (
                <Image
                    src={seller.image}
                  alt={seller?.name}
                  fill
                  className="object-contain rounded"
                    sizes="48px"
                  />
                ) : (
                  <Image
                    src="/images/logo/icon.png" // fallback image
                    alt="No image"
                    fill
                    sizes="48px"
                    className="object-contain rounded"
                />
                )}
              </div>
              <div>
                <p className="text-lg font-medium">{seller?.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
