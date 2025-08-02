import { Modal } from "@/components/ui/modal";
import { createPaymentOrder, checkOrderStatus, getOrdersByUser, prolongProxyOrder } from "@/store/bookings/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProxyPricing } from "@/store/proxies/actions";
import { getAuthToken } from "@/utils/authCookies";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaymentModal from "./PaymentModal";
import { useGuestUser } from "@/hooks/useGuestUser";

interface PaymentBuyClickModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  productId: string;
  orderId?: string;
  currentPage?: number;
  activeTab?: string;
  isProlong?: boolean;
  proxyDetails?: {
    username: string;
    expire: string;
    order_flow: string;
  } | null;
}

// Utility function to format the quantity with correct unit
const formatQuantityWithUnit = (tier: any) => {
  if (!tier) return "0";
  
  // Use userDataAmount and unit for the new API structure
  if (tier.userDataAmount && tier.unit) {
    return `${tier.userDataAmount} ${tier.unit}`;
  }
  
  // Fallback to userDataAmount with GB (for backward compatibility)
  return `${tier.userDataAmount || 1} GB`;
};

const PaymentBuyClickModal: React.FC<PaymentBuyClickModalProps> = ({
  isOpen,
  onClose,
  providerId,
  productId,
  orderId,
  currentPage,
  activeTab,
  isProlong = false,
  proxyDetails,
}) => {
  const dispatch = useAppDispatch();
  const { pricingPlans, fetchPricingPlans } = useAppSelector((state) => state.proxy);
  const { isOrderPaymentLoading, placingOrder, checkingOrderStatus } = useAppSelector((state) => state.booking);
  const { initializeGuestUserForCart } = useGuestUser();
  const popularTier = pricingPlans?.find((tier) => tier.isPopular);
  const otherTiers = pricingPlans?.filter((tier) => !tier?.isPopular);
  const [quantity, setQuantity] = useState(1);
  const [isProcessingGuest, setIsProcessingGuest] = useState(false);
  const [selectedTier, setSelectedTier] = useState<(typeof pricingPlans)[0] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleTierSelect = (tier: any) => {
    if (!tier) return;
    console.log('DEBUG: Tier selected:', tier);
    setSelectedTier(tier);
    setQuantity(1); // Default to 1 since quantity is no longer part of tier
  };

  const calculateTotalPrice = () => {
    if (!selectedTier) return "0.00";
    
    // Calculate total price based on selected tier price and quantity
    return (quantity * selectedTier.price).toFixed(2);
  };

  const handleBuyClick = async () => {
    if (!selectedTier) {
      toast.error("Please select a pricing tier");
      return;
    }

    if (!productId || !quantity || !providerId) {
      toast.error("Missing order information.");
      return;
    }

    // Check if user needs guest user initialization
    const token = getAuthToken();
    if (!token) {
      try {
        // Initialize guest user when buying
        await initializeGuestUserForCart();
        toast.success("Guest session created! You can now make purchases.");
      } catch (error) {
        toast.error("Failed to create guest session. Please try again.");
        return;
      }
    }

    console.log("DEBUG: Starting direct payment process with payload:", {
      productId,
      quantity,
      providerId,
      selectedTier
    });

    try {
              const orderPayload = {
          productId:Number(productId),
          currency: "USD",
          isOrder: true,
          quantity,
          type: "direct",
          providerId,
          // Add additional fields to ensure single order creation
          createSingleOrder: true,
          orderCount: 1,
          // Add prolong-specific fields
          ...(isProlong && orderId && {
            isProlong: true,
            existingOrderId: orderId,
            // Add flow and expire values for prolong flows
            flow: (() => {
              if (!selectedTier) return (1 * 1024 * 1024 * 1024).toString(); // Default to 1 GB
              
              const amount = selectedTier.userDataAmount || 1;
              const unit = selectedTier.unit || 'GB';
              
              // Convert to bytes based on unit
              if (unit.toUpperCase() === 'GB') {
                return (amount * 1024 * 1024 * 1024).toString();
              } else if (unit.toUpperCase() === 'MB') {
                return (amount * 1024 * 1024).toString();
              } else if (unit.toUpperCase() === 'KB') {
                return (amount * 1024).toString();
              } else {
                // Default to bytes
                return amount.toString();
              }
            })(),
            expire: (Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)).toString() // 90 days from now
          })
        };

      // Clear any old pending order before starting new payment
      localStorage.removeItem("pendingOrderId");

      const result = await dispatch(createPaymentOrder(orderPayload)).unwrap();

      console.log("DEBUG: Payment order created successfully:", result);

      if (result?.data?.result?.url) {
        // Store order_id for status checking when user returns
        localStorage.setItem("pendingOrderId", result.data.result.order_id);
        console.log("DEBUG: Stored order_id and redirecting to:", result.data.result.url);
        window.location.href = result.data.result.url;
      } else {
        throw new Error("Payment URL not found in response");
      }
      handleClose();
    } catch (error: any) {
      console.error(error?.message || "Payment failed. Please try again.");
      toast.error(error?.message || "Payment failed. Please try again.");
    }
  };

  const handleClose = () => {
    setQuantity(1);
    onClose();
  };

  useEffect(() => {
    if (!productId || !providerId) return;
    dispatch(getProxyPricing({ proxyId: productId, providerId }));
  }, [providerId, productId, dispatch]);

  // Check for pending orders when component mounts
  useEffect(() => {
    const checkPendingOrder = async () => {
      const pendingOrderId = localStorage.getItem("pendingOrderId");
      if (!pendingOrderId) return;
      
      try {
        const result = await dispatch(checkOrderStatus(pendingOrderId)).unwrap();
        if (result.success && result.data.status === 'completed') {
          // Order completed successfully
          localStorage.removeItem("pendingOrderId");
          toast.success("Payment completed! Your proxy has been created.");
          // Refresh orders to show the new proxy
          dispatch(getOrdersByUser({ page: 1, limit: 10, type: 'all' }));
        } else if (result.success && result.data.status === 'failed') {
          // Order failed
          localStorage.removeItem("pendingOrderId");
          toast.error("Payment failed. Please try again.");
        } else if (result.success && result.data.status === 'pending') {
          // Order is still pending - this is normal, don't show any message
          console.log("Order is still pending:", pendingOrderId);
        } else {
          // Unknown status or error - clear the old order_id
          localStorage.removeItem("pendingOrderId");
          console.log("Clearing old order_id due to unknown status:", result);
        }
      } catch (error) {
        // If there's an error checking the order, it might be an old/invalid order_id
        localStorage.removeItem("pendingOrderId");
        console.error("Failed to check order status, clearing old order_id:", error);
      }
    };
    
    checkPendingOrder();
  }, [dispatch]);

  // Set initial quantity when popular tier loads
  useEffect(() => {
    if (pricingPlans?.length > 0) {
      const initialTier = popularTier || pricingPlans[0];
      if (initialTier && !selectedTier) {
        setQuantity(1); // Default to 1 since quantity is no longer part of tier
        setSelectedTier(initialTier);
      }
    }
  }, [pricingPlans, popularTier, selectedTier]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setQuantity(1);
      setSelectedTier(null);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[520px] bg-[#090E15] p-6 rounded-xl"
    >
      <h4 className="font-bold text-white text-2xl mb-6">
        {isProlong ? "Prolong Proxy" : "Payment"}
      </h4>
      {/* Amount Selection */}
      <div className="mb-3 sm:mb-4">
        <div className="bg-[#090E15] mt-7 rounded-xl text-white font-sans">
          {fetchPricingPlans ? (
            <div className="flex justify-center items-center my-8">
              <Loader className="animate-spin text-[#13F195]" />
            </div>
          ) : (
            <>
              {popularTier && (
                <div
                  className={`bg-[#7BB9FF0D] rounded-lg p-2 text-center relative mb-5 cursor-pointer border transition-all ${
                    selectedTier?.userDataAmount === popularTier?.userDataAmount && selectedTier?.unit === popularTier?.unit
                      ? "border-[#13F195]"
                      : "border-transparent hover:border-green-400"
                  }`}
                  onClick={() => handleTierSelect(popularTier)}
                >
                  <div className="absolute -top-3 left-0 bg-[#13F195] text-black text-xs font-medium px-2 py-0.5 rounded-full uppercase">
                    Popular
                  </div>
                  <div className="text-white text-lg font-bold mb-1">
                    {formatQuantityWithUnit(popularTier)}{" "}
                    <span className="text-lg font-medium text-[#13F195]">
                      ${popularTier.price.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {otherTiers?.map((tier, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTierSelect(tier)}
                    className={`bg-[#7BB9FF0D] rounded-lg p-3 text-center mb-4 border transition-all cursor-pointer ${
                      selectedTier?.userDataAmount === tier?.userDataAmount && selectedTier?.unit === tier?.unit
                        ? "border-[#13F195]"
                        : "border-transparent hover:border-green-400"
                    }`}
                  >
                    <div className="text-white text-base font-bold">
                      {formatQuantityWithUnit(tier)}
                    </div>
                    <div className="text-[#13F195] text-sm font-semibold">
                      ${tier?.price?.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex items-center justify-between mb-5 mt-3 flex-wrap gap-y-2">
            <div className="flex items-center space-x-2">
              <>
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 py-0.5 bg-gray-700 rounded text-lg text-[#13F195]"
                  disabled={!popularTier || fetchPricingPlans}
                >
                  −
                </button>
                <input
                  type="text"
                  min="1"
                  inputMode="numeric"
                  value={quantity === 0 ? "" : quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setQuantity(0);
                      return;
                    }
                    const value = parseInt(val);
                    if (!isNaN(value) && value >= 0) {
                      setQuantity(value);
                    }
                  }}
                  className="w-20 text-center bg-gray-700 rounded text-lg text-[#13F195] px-1 py-0.5 appearance-none focus:outline-none focus:ring-2 focus:ring-[#13F195]"
                  disabled={!popularTier || fetchPricingPlans}
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2 py-0.5 bg-gray-700 rounded text-lg text-[#13F195]"
                  disabled={!popularTier || fetchPricingPlans}
                >
                  +
                </button>
              </>
            </div>
            <div className="text-[#13F195] text-lg font-semibold">
              ${calculateTotalPrice()}
            </div>
          </div>
        </div>
      </div>
      {/* Proceed Button */}
      <button
        type="button"
        onClick={() => setIsPaymentModalOpen(true)}
        disabled={
          !popularTier || fetchPricingPlans || isOrderPaymentLoading || quantity === 0
        }
        className="w-full py-3 rounded-lg font-semibold text-lg bg-[#7BB9FF1A] text-[#13F195] hover:bg-[#232b3f] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isOrderPaymentLoading ? "Processing..." : (isProlong ? "Prolong Proxy" : "Buy in 1 Click")}
      </button>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        productId={productId}
        providerId={providerId}
        quantity={quantity}
        totalPrice={calculateTotalPrice()}
        loading={isOrderPaymentLoading || placingOrder}
        orderId={orderId}
        selectedTier={selectedTier}
        isProlong={isProlong}
        onSuccess={async () => {
          // For prolong flows, the payment endpoint handles the prolong logic internally
          // No need to call separate prolong API
          console.log('DEBUG: Payment completed successfully');
          onClose();
        }}
        currentPage={currentPage}
        activeTab={activeTab}
      />
    </Modal>
  );
};

export default PaymentBuyClickModal;
