"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Eye, Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "../common/Tabs";
import Pagination from "../common/Pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getOrdersByUser, placeOrder } from "@/store/bookings/actions";
import { formatExpireStatus } from "@/utils/dateHelper";
import { bytesToGB } from "@/utils/bytesToGB";
import { getAuthToken } from "@/utils/authCookies";
import PaymentBuyClickModal from "../common/Modals/PaymentBuyClickModal";

interface Purchase {
  un_flow: number;
  un_flow_used: number;
  productId: any;
  providerId: any;
  Product: any;
  features: any;
  quantity: string;
  expire: any;
  id: string;
  name: string;
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
  type: "account" | "service";
  shop: string;
}

const TAB_OPTIONS = [
  { value: "all" },
  { value: "proxy" },
  { value: "Accounts", comingSoon: true, disabled: true },
  { value: "Service", comingSoon: true, disabled: true },
];
const PurchaseBadge = ({
  shop,
  type,
  variant = "desktop",
}: {
  shop: string;
  type?: string;
  variant?: "desktop" | "mobile";
}) => {
  if (variant === "mobile") {
    return (
      <div className="w-full pb-1">
        <div className="w-full flex items-center justify-center px-2 py-1 rounded-t-md text-xs font-medium bg-[#13F1951A] text-[#13F195] z-1">
          <span className="mr-2 text-[#13F195]">Proxy [{type}]</span>
          <span className="text-[#7a8895]">{shop}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 z-1">
      <span className="inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium bg-[#13F1951A] ">
        <span className="mr-2 text-[#13F195]">Proxy [{type}]</span>
        <span className="text-[#7a8895]">{shop}</span>
      </span>
    </div>
  );
};

const DesktopPurchaseList = ({
  purchases,
  onAddToCart,
}: {
  purchases: Purchase[];
  onAddToCart: (purchase: Purchase) => void;
}) => {
  const router = useRouter();

  if (!purchases.length) {
    return (
      <div className="hidden sm:flex flex-col items-center justify-center text-center mt-8 px-6 py-10 bg-[#0F1721] rounded-2xl">
        <h2 className="text-white font-semibold text-lg mt-4">You have no purchases</h2>
      </div>
    );
  }

  return (
    <div className="hidden sm:block mt-8 bg-[#090e15] rounded-2xl overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-white border-b border-[#142133]">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-3">Dates</div>
          <div className="col-span-1"></div>
        </div>
        <div>
          {purchases.map((purchase: Purchase) => {
            const expireStatus = formatExpireStatus(purchase?.expire);
            const isExpired = expireStatus === "Expired";
            return (
              <div
                key={purchase?.id}
                className="bg-[#090e15] border-y border-[#142133] transition-colors duration-200 relative"
              >
                <PurchaseBadge
                  shop={purchase?.Product?.name}
                  type={purchase?.Product?.type}
                  variant="desktop"
                />
                <div className="grid grid-cols-12 gap-4 items-center p-4 pt-8">
                  <div className="col-span-6 flex items-center space-x-3">
                    <div className="text-sm sm:text-base text-white line-clamp-2">
                      {purchase?.Product?.features?.join(", ")}
                    </div>
                  </div>
                  <div className="col-span-2 text-[#13F195] font-sm">
                    <span>
                      {bytesToGB(purchase?.un_flow_used ?? 0)} GB /{" "}
                      {bytesToGB(purchase?.un_flow ?? 0)} GB
                    </span>
                  </div>
                  <div className="col-span-3 text-sm flex items-center">
                    {purchase?.expire ? (
                      <>
                        <span
                          className={`mr-1 font-medium ${
                            isExpired ? "text-[#7A8895]" : "text-[#13F195]"
                          }`}
                        >
                          {new Date(purchase?.expire * 1000).toLocaleDateString("en-GB")}/
                        </span>
                        <span
                          className={`ml-1 font-medium ${
                            isExpired ? "text-[#FF3F3C]" : "text-[#13F195]"
                          }`}
                        >
                          {expireStatus}
                        </span>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="col-span-1 flex items-center space-x-2 ml-4">
                    <button
                      className={`p-2 rounded-lg transition-colors duration-200 bg-[#13F195] hover:bg-[#0ddb7f]`}
                      onClick={() => onAddToCart(purchase)}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    {!isExpired && (
                      <button
                        onClick={() => router.push(`/generate-proxy/${purchase?.id}`)}
                        className="p-2 bg-[#13F195] rounded-lg transition-colors duration-200"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MobilePurchaseList = ({
  purchases,
  onAddToCart,
}:
{
  purchases: Purchase[];
  onAddToCart: (purchase: Purchase) => void;
}) => {
  const router = useRouter();

  if (!purchases.length) {
    return (
      <div className="block sm:hidden mt-8 flex flex-col items-center justify-center text-center px-6 py-10 bg-[#0F1721] rounded-2xl">
        <h2 className="text-white font-semibold text-sm mt-4">You have no purchases</h2>
      </div>
    );
  }

  return (
    <div className="block sm:hidden mt-8 rounded-2xl">
      <div className="space-y-2">
        {purchases.map((purchase) => {
          const expireStatus = formatExpireStatus(purchase?.expire);
          const isExpired = expireStatus === "Expired";
          return (
            <div
              key={purchase.id}
              className="bg-[#090e15] rounded-lg border border-[#142133] transition-colors duration-200 relative"
            >
              <PurchaseBadge
                shop={purchase?.Product?.name}
                type={purchase?.Product?.type}
                variant="mobile"
              />
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white text-sm line-clamp-2">
                        {purchase?.Product?.features?.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 text-[#13F195] font-medium text-xs">
                      <span>Amount:</span>
                      <span>
                        {bytesToGB(purchase?.un_flow_used ?? 0)} /{" "}
                        {bytesToGB(purchase?.un_flow ?? 0)}
                      </span>{" "}
                    </div>
                    <div className="text-[#13F195] text-xs flex items-center gap-1">
                      <span>Dates:</span>
                      <span>
                        {purchase?.expire ? (
                          <>
                            <span
                              className={`mr-1 font-medium ${
                                isExpired ? "text-[#7A8895]" : "text-[#13F195]"
                              }`}
                            >
                              {new Date(purchase?.expire * 1000).toLocaleDateString(
                                "en-GB"
                              )}
                              /
                            </span>
                            <span
                              className={`ml-1 font-medium ${
                                isExpired ? "text-[#FF3F3C]" : "text-[#13F195]"
                              }`}
                            >
                              {expireStatus}
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      className={`p-2 rounded-lg transition-colors duration-200  bg-[#13F195] hover:bg-[#0ddb7f]`}
                      onClick={() => onAddToCart(purchase)}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    {!isExpired && (
                      <button
                        onClick={() => router.push(`/generate-proxy/${purchase?.id}`)}
                        className="p-2 bg-[#13F195] rounded-lg transition-colors duration-200"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MyPurchases = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { orders, fetchingOrders, ordersPagination } = useAppSelector(
    (state) => state.booking
  );
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const handleOpenBuyModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsBuyModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    // Only fetch if orders are not loaded for the current page/tab
    if (!orders || orders.length === 0 || ordersPagination?.currentPage !== currentPage || ordersPagination?.activeTab !== activeTab) {
      dispatch(
        getOrdersByUser({
          page: currentPage,
          limit: 10,
          type: activeTab,
        })
      );
    }
  }, [dispatch, activeTab, currentPage, orders, ordersPagination, activeTab]);

  useEffect(() => {
    const execute = async () => {
      const productId = searchParams.get("productId");
      const quantity = searchParams.get("quantity");
      const type = searchParams.get("type");
      const orderId = searchParams.get("orderId");
      const providerId = searchParams.get("providerId");

      if (!productId || !quantity || !orderId) return;

      try {
        await dispatch(
          placeOrder({
            productId:Number(productId),
            quantity: Number(quantity),
            orderId: Number(orderId),
            type,
            providerId,
          })
        ).unwrap();

        await dispatch(
          getOrdersByUser({
            page: currentPage,
            limit: 10,
            type: activeTab,
          })
        );
      } catch (err) {
        console.error("Order placement failed", err);
      } finally {
        const newUrl = window.location.pathname;
        router.replace(newUrl);
      }
    };

    execute();
  }, [dispatch, searchParams, router, currentPage, activeTab]);

  return (
    <div className="container-fluid mx-auto py-2">
      <Tabs
        tabs={TAB_OPTIONS}
        defaultTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {fetchingOrders ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-8 w-8 text-[#13F195]" />
        </div>
      ) : (
        <>
          <DesktopPurchaseList
            purchases={orders}
            onAddToCart={handleOpenBuyModal}
          />

          <MobilePurchaseList
            purchases={orders}
            onAddToCart={handleOpenBuyModal}
          />

          {ordersPagination?.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={ordersPagination?.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          
          {isBuyModalOpen && selectedPurchase && (
            <PaymentBuyClickModal
              isOpen={isBuyModalOpen}
              onClose={() => setIsBuyModalOpen(false)}
              providerId={selectedPurchase?.providerId}
              productId={selectedPurchase?.Product?.id}
              orderId={selectedPurchase?.id}
              currentPage={currentPage}
              activeTab={activeTab}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MyPurchases;
