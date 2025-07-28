"use client";
import React, { useEffect, useState } from "react";
import FiltersModal from "./FiltersModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProxies } from "@/store/proxies/actions";
import { ChevronDown, Loader } from "lucide-react";
import ProxyCard from "./ProxyCard";
import { useRouter } from "next/navigation";

const FILTERS = [
  "Confirmed by mail",
  "Confirmed by Phone",
  "Secured",
  "Tdata",
  "Json",
  "2FA",
  "USA",
  "Europe",
  "England",
];

// Options for each dropdown category
const DROPDOWN_OPTIONS = {
  Platform: ["Platform", "Telegram", "WhatsApp", "Discord", "Twitter"],
  Country: ["Country", "USA", "UK", "Germany", "France", "Canada", "Japan"],
  Seller: ["Seller", "Verified Only", "Top Rated", "New Sellers"],
  Price: ["Price", "Under $10", "$10-$50", "$50-$100", "Over $100"],
};

const Proxy: React.FC = () => {
  const { proxies, fetchingProxies } = useAppSelector((state) => state.proxy);
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const router = useRouter();

  // Fetch proxies on component mount
  useEffect(() => {
    if (!proxies || proxies.length === 0) {
      dispatch(getProxies());
    }
  }, [dispatch, proxies]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <>
      <div className="min-h-screen">
        {fetchingProxies ? (
          <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin text-[#13F195]" />
          </div>
        ) : (
          <div className="max-w-8xl mx-auto">
            <div className="mb-8">
              <div className="flex flex-col gap-4 mb-4 md:flex-row md:justify-between md:items-center">
                <h1 className="text-2xl font-bold text-white whitespace-nowrap">
                  Proxy market
                </h1>

                {/* Dropdown grid container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
                  {Object.entries(DROPDOWN_OPTIONS).map(([category, options]) => (
                    <div key={category} className="relative w-full">
                      <select
                        className="appearance-none bg-[#7BB9FF0D] text-[#7A8895] text-[16px] py-2 px-4 pr-8 rounded-lg focus:outline-none cursor-pointer w-full"
                        defaultValue={options[0]}
                      >
                        {options.map((option, index) => (
                          <option
                            key={option}
                            value={option}
                            className="bg-[#1C2430] text-[#7A8895]"
                            disabled={index === 0}
                            hidden={index === 0}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <ChevronDown size={18} className="text-[#7A8895]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters: in next stages will be added */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div className="overflow-x-auto custom-scrollbar w-full py-2">
                    <div className="flex gap-2 items-center">
                      {FILTERS.map((filter, index) => {
                        const isActive = activeFilters.includes(filter);
                        return (
                          <button
                            key={index}
                            onClick={() => toggleFilter(filter)}
                            className={`px-4 py-1 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                              isActive
                                ? "bg-[#13F1951A] text-[#13F195]"
                                : "bg-[#7BB9FF0D] text-[#7A8895] hover:bg-[#2C3A4D]"
                            }`}
                          >
                            {filter}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      className="ml-4 px-4 py-1 text-sm font-medium rounded-full whitespace-nowrap bg-[#1C2430] text-[#7A8895] hover:bg-gray-600"
                      onClick={() => setIsOpen(true)}
                    >
                      See all
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Proxy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {proxies?.map((proxy, index) => {
                let lowestPrice: number | null = null;
                let mainProviderId: string | null = null;
                if (Array.isArray(proxy.providers) && proxy.providers.length > 0) {
                  proxy.providers.forEach((provider: any) => {
                    if (Array.isArray(provider.pricing) && provider.pricing.length > 0) {
                      provider.pricing.forEach((tier: any) => {
                        if (typeof tier.price === 'number' && (lowestPrice === null || tier.price < lowestPrice)) {
                          lowestPrice = tier.price;
                          mainProviderId = provider.providerId;
                        }
                      });
                    }
                  });
                }
                // Map providers for the card (if needed)
                const mappedProviders = Array.isArray(proxy.providers)
                  ? proxy.providers.map((provider: any) => ({
                      id: provider.providerId,
                      image: provider.image,
                      pricing: provider.pricing,
                    }))
                  : [];
                const mappedProxy = {
                  id: proxy._id,
                  image: proxy.logo,
                  rating: proxy.rating,
                  name: proxy.name,
                  features: Array.isArray(proxy.tags) ? proxy.tags : [],
                  price: lowestPrice !== null ? lowestPrice : 0,
                  Providers: mappedProviders,
                  mainProviderId,
                };
                return <ProxyCard key={index} proxy={mappedProxy} index={index} />;
              })}
            </div>
          </div>
        )}
      </div>
      {isOpen && <FiltersModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default Proxy;
