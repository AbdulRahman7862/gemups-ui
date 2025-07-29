"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCart, Eye, Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Tabs from "../common/Tabs";
import Pagination from "../common/Pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getOrdersByUser, placeOrder } from "@/store/bookings/actions";
import { bytesToGB } from "@/utils/bytesToGB";
import { getAuthToken } from "@/utils/authCookies";
import PaymentBuyClickModal from "../common/Modals/PaymentBuyClickModal";
import { axiosInstance } from "@/utils/axiosInstance";

// Helper function to convert Unix timestamp to readable date
const formatUnixTimestamp = (unixTimestamp: string | number): string => {
  try {
    const timestamp = typeof unixTimestamp === 'string' ? parseInt(unixTimestamp) : unixTimestamp;
    if (isNaN(timestamp) || timestamp === 0) {
      return "N/A";
    }
    
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  } catch (error) {
    console.error("Error formatting Unix timestamp:", error);
    return "N/A";
  }
};

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
  type: "account" | "service" | "proxy";
  shop: string;
  order_no?: string;
  proxyDetails?: {
    order_flow_after: string;
    order_flow: string;
    expire: string;
    order_no?: string;
    un_flow_used?: string;
    un_flow?: string;
  };
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
  isLoading = false,
  fetchingProxyDetails = false,
}: {
  purchases: Purchase[];
  onAddToCart: (purchase: Purchase) => void;
  isLoading?: boolean;
  fetchingProxyDetails?: boolean;
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="hidden sm:flex justify-center items-center py-20">
        <Loader className="animate-spin h-8 w-8 text-[#13F195]" />
      </div>
    );
  }

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
            <div className="col-span-5">Name</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Actions</div>
          </div>
        <div>
          {purchases.map((purchase: Purchase) => {
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
                  <div className="col-span-5 flex items-center space-x-3">
                    <div className="text-sm sm:text-base text-white line-clamp-2">
                      {purchase?.Product?.name || purchase?.type}
                    </div>
                  </div>
                  <div className="col-span-2 text-[#13F195] font-sm">
                    {fetchingProxyDetails ? (
                      <span className="text-xs text-gray-400">Loading...</span>
                    ) : purchase?.proxyDetails ? (
                      <span className="text-xs text-[#13F195]">
                        {(() => {
                          const used = parseInt(purchase.proxyDetails.un_flow_used || "0");
                          const total = parseInt(purchase.proxyDetails.un_flow || "0");
                          const remaining = total - used;
                          
                          // Better unit detection logic
                          if (total === 0) {
                            return "0 / 0 GB";
                          }
                          
                          // If total is very small (< 1), it's likely already in GB
                          if (total < 1) {
                            return `${remaining.toFixed(5)} / ${total.toFixed(5)} GB`;
                          }
                          
                          // If total is small but >= 1, it might be in MB
                          if (total < 1024) {
                            // Likely in MB, convert to GB
                            return `${(remaining / 1024).toFixed(2)} / ${(total / 1024).toFixed(2)} GB`;
                          } else {
                            // Likely in bytes, use bytesToGB
                            return `${bytesToGB(remaining)} / ${bytesToGB(total)} GB`;
                          }
                        })()}
                      </span>
                    ) : purchase?.quantity ? (
                      <span className="text-xs text-[#13F195]">
                        {purchase.quantity} {purchase.type === 'proxy' ? 'GB' : 'items'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No data</span>
                    )}
                  </div>
                  <div className="col-span-3 text-sm flex items-center">
                    {fetchingProxyDetails ? (
                      <span className="text-xs text-gray-400">Loading...</span>
                    ) : purchase?.proxyDetails?.expire ? (
                      <span className="mr-1 font-medium text-[#13F195]">
                        {formatUnixTimestamp(purchase.proxyDetails.expire)}
                      </span>
                    ) : purchase?.date ? (
                      <span className="mr-1 font-medium text-[#13F195]">
                        {new Date(purchase?.date).toLocaleDateString("en-GB")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-start space-x-2">
                    <button
                      className={`p-2 rounded-lg transition-colors duration-200 bg-[#13F195] hover:bg-[#0ddb7f]`}
                      onClick={() => onAddToCart(purchase)}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button
                      onClick={() => router.push(`/generate-proxy/${purchase?.id}`)}
                      className="p-2 bg-[#13F195] rounded-lg transition-colors duration-200"
                    >
                      <Eye size={18} />
                    </button>
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
  isLoading = false,
  fetchingProxyDetails = false,
}:
{
  purchases: Purchase[];
  onAddToCart: (purchase: Purchase) => void;
  isLoading?: boolean;
  fetchingProxyDetails?: boolean;
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="block sm:hidden flex justify-center items-center py-20">
        <Loader className="animate-spin h-8 w-8 text-[#13F195]" />
      </div>
    );
  }

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
                        {purchase?.Product?.name || purchase?.type}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    {fetchingProxyDetails ? (
                      <div className="text-[#13F195] text-xs text-gray-400">Loading...</div>
                    ) : purchase?.proxyDetails ? (
                      <div className="text-[#13F195] text-xs">
                        {(() => {
                          const used = parseInt(purchase.proxyDetails.un_flow_used || "0");
                          const total = parseInt(purchase.proxyDetails.un_flow || "0");
                          const remaining = total - used;
                          
                          // Better unit detection logic
                          if (total === 0) {
                            return "0 / 0 GB";
                          }
                          
                          // If total is very small (< 1), it's likely already in GB
                          if (total < 1) {
                            return `${remaining.toFixed(5)} / ${total.toFixed(5)} GB`;
                          }
                          
                          // If total is small but >= 1, it might be in MB
                          if (total < 1024) {
                            // Likely in MB, convert to GB
                            return `${(remaining / 1024).toFixed(2)} / ${(total / 1024).toFixed(2)} GB`;
                          } else {
                            // Likely in bytes, use bytesToGB
                            return `${bytesToGB(remaining)} / ${bytesToGB(total)} GB`;
                          }
                        })()}
                      </div>
                    ) : purchase?.quantity ? (
                      <div className="text-[#13F195] text-xs">
                        {purchase.quantity} {purchase.type === 'proxy' ? 'GB' : 'items'}
                      </div>
                    ) : (
                      <div className="text-[#13F195] text-xs text-gray-400">No data</div>
                    )}
                    <div className="text-[#13F195] text-xs flex items-center gap-1">
                      <span>Date:</span>
                      <span>
                        {fetchingProxyDetails ? (
                          <span className="text-xs text-gray-400">Loading...</span>
                        ) : purchase?.proxyDetails?.expire ? (
                          <span className="mr-1 font-medium text-[#13F195]">
                            {formatUnixTimestamp(purchase.proxyDetails.expire)}
                          </span>
                        ) : purchase?.date ? (
                          <span className="mr-1 font-medium text-[#13F195]">
                            {new Date(purchase?.date).toLocaleDateString("en-GB")}
                          </span>
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
                    <button
                      onClick={() => router.push(`/generate-proxy/${purchase?.id}`)}
                      className="p-2 bg-[#13F195] rounded-lg transition-colors duration-200"
                    >
                      <Eye size={18} />
                    </button>
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
  const [purchasesWithProxyDetails, setPurchasesWithProxyDetails] = useState<Purchase[]>([]);
  const [fetchingProxyDetails, setFetchingProxyDetails] = useState(false);

  const handleOpenBuyModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsBuyModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch proxy details for orders
  const fetchProxyDetailsForOrders = async (ordersList: Purchase[]) => {
    // Validate input
    if (!ordersList || !Array.isArray(ordersList) || ordersList.length === 0) {
      console.log("DEBUG: No orders to process, setting empty array");
      setPurchasesWithProxyDetails([]);
      setFetchingProxyDetails(false);
      return;
    }

    setFetchingProxyDetails(true);
    console.log(`DEBUG: Starting to fetch proxy details for ${ordersList.length} orders`);
    
    try {
      const ordersWithDetails = await Promise.allSettled(
        ordersList.map(async (order, index) => {
          console.log(`DEBUG: Processing order ${index + 1}/${ordersList.length}: ${order.id}`);
          
          // Validate order object
          if (!order || !order.id) {
            console.warn(`DEBUG: Invalid order object at index ${index}:`, order);
            return order;
          }
          
          // Process ALL orders to fetch proxy details for each one
          try {
            // Debug: Log the order structure to understand what's available
            console.log(`DEBUG: Order structure for ${order.id}:`, order);
            
            // Try to find the correct order identifier for proxy details
            let orderIdentifier = null;
            
            // First, check if the order has a proxyDetails object with order_no
            if (order.proxyDetails?.order_no) {
              orderIdentifier = order.proxyDetails.order_no;
            }
            // Check if order_no is directly in the order object
            else if (order.order_no) {
              orderIdentifier = order.order_no;
            }
            // Check if there's a nested proxyDetails object with order_no
            else if (order.proxyDetails && typeof order.proxyDetails === 'object') {
              const nestedProxyDetails = order.proxyDetails as any;
              if (nestedProxyDetails.order_no) {
                orderIdentifier = nestedProxyDetails.order_no;
              }
            }
            // For all orders, try using the order ID as the proxy order identifier
            else if (order.id) {
              orderIdentifier = order.id;
            }
            
            // If we found a valid identifier, try to fetch proxy details
            if (orderIdentifier) {
              console.log(`DEBUG: Fetching proxy details for order ${order.id} using identifier: ${orderIdentifier}`);
              
              try {
                // Direct API call to get proxy details for this order
                const proxyDetails = await fetchProxyDetailsDirectly(orderIdentifier);
                
                console.log(`DEBUG: Successfully fetched proxy details for order ${order.id}:`, proxyDetails);
                
                // Check if we got valid proxy details (not null and has required fields)
                if (proxyDetails && proxyDetails.code === 200 && (proxyDetails.un_flow || proxyDetails.un_flow_used)) {
                  // Return order with updated proxy details
                  const updatedOrder = {
                    ...order,
                    proxyDetails: {
                      order_flow_after: proxyDetails.order_flow_after || "0",
                      order_flow: proxyDetails.order_flow || "0",
                      expire: proxyDetails.expire || "",
                      order_no: orderIdentifier,
                      un_flow_used: proxyDetails.un_flow_used || "0",
                      un_flow: proxyDetails.un_flow || "0",
                    }
                  };
                  console.log(`DEBUG: Updated order ${order.id} with proxy details:`, updatedOrder.proxyDetails);
                  return updatedOrder;
                } else if (proxyDetails === null) {
                  // API returned null (404 or other error), use fallback data
                  console.log(`DEBUG: No proxy details found for order ${order.id}, using fallback`);
                  const fallbackOrder = {
                    ...order,
                    proxyDetails: {
                      order_flow_after: "0",
                      order_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                      expire: order.expire?.toString() || "",
                      order_no: order.order_no || order.id,
                      un_flow_used: order.un_flow_used?.toString() || "0",
                      un_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                    }
                  };
                  console.log(`DEBUG: Using fallback proxy details for order ${order.id}:`, fallbackOrder.proxyDetails);
                  return fallbackOrder;
                } else {
                  // Invalid response format, use fallback data
                  console.log(`DEBUG: Invalid proxy details response for order ${order.id}, using fallback`);
                  const fallbackOrder = {
                    ...order,
                    proxyDetails: {
                      order_flow_after: "0",
                      order_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                      expire: order.expire?.toString() || "",
                      order_no: order.order_no || order.id,
                      un_flow_used: order.un_flow_used?.toString() || "0",
                      un_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                    }
                  };
                  console.log(`DEBUG: Using fallback proxy details for order ${order.id}:`, fallbackOrder.proxyDetails);
                  return fallbackOrder;
                }
              } catch (error) {
                console.warn(`Failed to fetch proxy details for order ${order.id}:`, error);
                // Use fallback data on error
                const errorFallbackOrder = {
                  ...order,
                  proxyDetails: {
                    order_flow_after: "0",
                    order_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                    expire: order.expire?.toString() || "",
                    order_no: order.order_no || order.id,
                    un_flow_used: order.un_flow_used?.toString() || "0",
                    un_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                  }
                };
                console.log(`DEBUG: Using error fallback proxy details for order ${order.id}:`, errorFallbackOrder.proxyDetails);
                return errorFallbackOrder;
              }
            }
            
            // For all orders (including cart orders, pending orders, etc.), ensure they have proxyDetails
            // Use the order's own data as fallback
            const fallbackOrder = {
              ...order,
              proxyDetails: {
                order_flow_after: "0",
                order_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                expire: order.expire?.toString() || "",
                order_no: order.order_no || order.id,
                un_flow_used: order.un_flow_used?.toString() || "0",
                un_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
              }
            };
            console.log(`DEBUG: Using fallback proxy details for order ${order.id} (type: ${order.type}, status: ${order.status}):`, fallbackOrder.proxyDetails);
            return fallbackOrder;
            
          } catch (error) {
            console.error(`Failed to process order ${order.id}:`, error);
            // Return order with basic fallback proxy details if processing fails
            const errorFallbackOrder = {
              ...order,
              proxyDetails: {
                order_flow_after: "0",
                order_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
                expire: order.expire?.toString() || "",
                order_no: order.order_no || order.id,
                un_flow_used: order.un_flow_used?.toString() || "0",
                un_flow: order.un_flow?.toString() || order.quantity?.toString() || "0",
            }
            };
            console.log(`DEBUG: Using error fallback proxy details for order ${order.id}:`, errorFallbackOrder.proxyDetails);
            return errorFallbackOrder;
          }
        })
      );
      
      // Process Promise.allSettled results
      const successfulOrders: Purchase[] = [];
      const failedOrders: any[] = [];
      
      ordersWithDetails.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulOrders.push(result.value);
        } else {
          failedOrders.push({ index, reason: result.reason });
          console.warn(`DEBUG: Order at index ${index} failed:`, result.reason);
        }
      });
      
      if (failedOrders.length > 0) {
        console.warn(`DEBUG: ${failedOrders.length} orders failed to process:`, failedOrders);
      }
      
      console.log(`DEBUG: Completed fetching proxy details for all orders. Final result:`, successfulOrders);
      setPurchasesWithProxyDetails(successfulOrders);
    } finally {
      setFetchingProxyDetails(false);
      console.log(`DEBUG: Finished proxy details fetching process`);
    }
  };

  // Direct API call function to avoid Redux store race conditions
  const fetchProxyDetailsDirectly = async (orderIdentifier: string) => {
    try {
      // Try different possible endpoints and formats
      let response;
      
      // First try the standard proxy order endpoint
      try {
        response = await axiosInstance.get(`/api/proxy/order/${orderIdentifier}`);
        return response.data;
      } catch (firstError: any) {
        console.log(`DEBUG: First attempt failed for ${orderIdentifier}:`, firstError.response?.status);
        
        // Handle 404 errors gracefully
        if (firstError.response?.status === 404) {
          console.log(`DEBUG: 404 - Order ${orderIdentifier} not found, skipping`);
          return null; // Return null to indicate no data found
        }
        
        // If it's a 400 error, try alternative approaches
        if (firstError.response?.status === 400) {
          // Try without the /api prefix
          try {
            response = await axiosInstance.get(`/proxy/order/${orderIdentifier}`);
            return response.data;
          } catch (secondError: any) {
            console.log(`DEBUG: Second attempt failed for ${orderIdentifier}:`, secondError.response?.status);
            
            // Handle 404 errors gracefully
            if (secondError.response?.status === 404) {
              console.log(`DEBUG: 404 - Order ${orderIdentifier} not found, skipping`);
              return null;
            }
            
            // Try using the order endpoint instead
            try {
              response = await axiosInstance.get(`/api/order/${orderIdentifier}`);
              return response.data;
            } catch (thirdError: any) {
              console.log(`DEBUG: Third attempt failed for ${orderIdentifier}:`, thirdError.response?.status);
              
              // Handle 404 errors gracefully
              if (thirdError.response?.status === 404) {
                console.log(`DEBUG: 404 - Order ${orderIdentifier} not found, skipping`);
                return null;
              }
              
              // If all attempts fail, return null instead of throwing
              console.log(`DEBUG: All attempts failed for ${orderIdentifier}, returning null`);
              return null;
            }
          }
        } else {
          // For other errors, return null instead of throwing
          console.log(`DEBUG: Non-400 error for ${orderIdentifier}, returning null`);
          return null;
        }
      }
    } catch (error: any) {
      console.log('DEBUG Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message,
        orderIdentifier: orderIdentifier
      });
      
      // Log the full error response for debugging
      console.log('DEBUG Full error response:', error.response);
      console.log('DEBUG Error response data:', error.response?.data);
      
      // Return null instead of throwing to prevent crashes
      return null;
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    console.log("Dispatching getOrdersByUser", { page: currentPage, limit: 10, type: activeTab });
    dispatch(
      getOrdersByUser({
        page: currentPage,
        limit: 10,
        type: activeTab,
      })
    );
  }, [dispatch, activeTab, currentPage]);

  // Fetch proxy details when orders are loaded
  useEffect(() => {
    if (orders && orders.length > 0) {
      fetchProxyDetailsForOrders(orders);
    } else {
      // If no orders, clear the purchases with proxy details
      setPurchasesWithProxyDetails([]);
    }
  }, [orders, dispatch]);

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

      {(fetchingOrders || fetchingProxyDetails) ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin h-8 w-8 text-[#13F195]" />
        </div>
      ) : (
        <>
          <DesktopPurchaseList
            purchases={purchasesWithProxyDetails}
            onAddToCart={handleOpenBuyModal}
            isLoading={fetchingProxyDetails}
            fetchingProxyDetails={fetchingProxyDetails}
          />

          <MobilePurchaseList
            purchases={purchasesWithProxyDetails}
            onAddToCart={handleOpenBuyModal}
            isLoading={fetchingProxyDetails}
            fetchingProxyDetails={fetchingProxyDetails}
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
