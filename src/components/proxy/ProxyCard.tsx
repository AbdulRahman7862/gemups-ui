import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import PaymentBuyClickModal from "../common/Modals/PaymentBuyClickModal";

interface Provider {
  image: string;
}

interface Proxy {
  id: string;
  image: string;
  rating: number;
  name: string;
  features: string[];
  price: number;
  Providers?: Provider[];
}

interface ProxyCardProps {
  proxy: Proxy;
  index: number;
}

const ProxyCard: React.FC<ProxyCardProps> = ({ proxy, index }) => {
  const router = useRouter();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const providerCount = proxy?.Providers?.length ?? 0;

  const handleOpenBuyModal = (proxy: any) => {
    setSelectedProduct(proxy);
    setIsBuyModalOpen(true);
  };

  return (
    <div
      onClick={() => {
        if (index > 0) {
          toast.info("This product will be available in the next stage");
        } else {
          router.push(`/proxy/detail/${proxy?.id}`);
        }
      }}
      className="rounded-xl bg-[#090E15] hover:bg-[#1C2430] transition-all duration-300 p-4 cursor-pointer"
    >
      <div className="flex items-center">
        {/* In next stage  */}
        {/* <button
                    onClick={(e) => e.stopPropagation()}
                    className="text-white bg-[#13F1951A] hover:bg-[#2B374B] p-2 rounded-full transition"
                  >
                    <Image src={shield} alt="shield" width={24} height={24} />
                  </button> */}
        {/* {["Confirmed by mail", "Tdata", "Europe"].map((filter, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 mx-[6px] text-sm font-medium rounded-full whitespace-nowrap transition-colors bg-[#7BB9FF0D] text-[#7A8895] hover:bg-gray-700`}
                    >
                      {filter}
                    </button>
                  ))} */}
      </div>
      <div className="flex justify-center mb-3 mt-4">
        <div className="w-16 h-16 bg-[#0E1118] rounded-xl flex items-center justify-center">
          <Image
            src={proxy?.image}
            alt="Proxy logo"
            width={24}
            height={24}
            className="rounded border-2 border-[#0C121D]"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs px-[6px] py-1 rounded-sm bg-[#13F1951A] text-white font-medium">
            <span className="text-[#13F195]">★</span>
            {proxy.rating}
          </span>
          <span className="text-sm text-[#7A8895] font-semibold">{proxy.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {proxy?.Providers?.map((provider, index) => (
              <Image
                key={index}
                src={provider.image}
                alt="Provider logo"
                width={24}
                height={24}
                className="rounded-full border-2 border-[#0C121D]"
              />
            ))}
          </div>
          <span className="text-sm text-gray-400">
            {providerCount} {providerCount === 1 ? "seller" : "sellers"}
          </span>
        </div>
      </div>
      <div className="mb-4 mt-4">
        <p className="text-center text-white text-[16px] break-words px-2 min-h-[48px]">
          {Array.isArray(proxy.features) && proxy.features.length > 0
            ? proxy.features.join(" • ")
            : "N/A"}
        </p>
        <div className="flex justify-center mt-2">
          <svg
            className="w-4 h-4 text-[#7A8895]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <div className="border-t border-[#1C2430] mt-3"></div>
      </div>
      <div className="mt-4 px-3 py-2 rounded-lg flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-[#13F195] font-semibold text-sm bg-[#7BB9FF0D] p-[10px] rounded-lg">
            {proxy?.price}$
          </span>
          <div className="flex flex-col items-end">
            {index > 0 && (
              <>
                <span className="text-[#7A8895] text-sm">
                  Only <span className="text-white">120</span> pieces left
                </span>
                <div className="w-full h-1 bg-[#1C2430] rounded-full mt-1">
                  <div
                    className="h-1 bg-[#13F195] rounded-full"
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={(e) => {
              handleOpenBuyModal(proxy);
              e.stopPropagation();
            }}
            disabled= {index > 0}
            className="text-white bg-[#1C2430] hover:bg-[#2B374B] p-2 rounded-lg transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h11a1 1 0 001-1v-1M7 13L5.4 5M16 21a1 1 0 11-2 0 1 1 0 012 0zm-8 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </button>
        </div>
      </div>
      {isBuyModalOpen && selectedProduct && (
        <PaymentBuyClickModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          providerId={selectedProduct?.Providers?.[0]?.id}
          productId={selectedProduct?.id}
        />
      )}
    </div>
  );
};

export default ProxyCard;
