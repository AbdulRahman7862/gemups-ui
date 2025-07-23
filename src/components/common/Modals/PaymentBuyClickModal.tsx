import { Modal } from "@/components/ui/modal";
import { createPaymentOrder } from "@/store/bookings/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProxyPricing } from "@/store/proxies/actions";
import { addUser } from "@/store/user/actions";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";
import { getOrCreateDeviceIdClient } from "@/utils/deviceId";
import { Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PaymentModal from "./PaymentModal";

interface PaymentBuyClickModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string;
  productId: string;
  orderId?: string;
  currentPage?: number;
  activeTab?: string;
}

const PaymentBuyClickModal: React.FC<PaymentBuyClickModalProps> = ({
  isOpen,
  onClose,
  providerId,
  productId,
  orderId,
  currentPage,
  activeTab,
}) => {
  const dispatch = useAppDispatch();
  const { pricingPlans, fetchPricingPlans } = useAppSelector((state) => state.proxy);
  const { isOrderPaymentLoading, placingOrder } = useAppSelector((state) => state.booking);
  const popularTier = pricingPlans?.find((tier) => tier.isPopular);
  const otherTiers = pricingPlans?.filter((tier) => !tier?.isPopular);
  const [quantity, setQuantity] = useState(1);
  const [isProcessingGuest, setIsProcessingGuest] = useState(false);
  const [selectedTier, setSelectedTier] = useState<(typeof pricingPlans)[0] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleTierSelect = (tier: any) => {
    if (!tier) return;
    setSelectedTier(tier);
    setQuantity(tier?.quantity);
  };

  const calculateTotalPrice = () => {
    if (!pricingPlans || pricingPlans.length === 0) return "0.00";

    const sortedTiers = [...pricingPlans].sort((a, b) => a.quantity - b.quantity);
    let pricePerPc = sortedTiers[0]?.price;

    for (let i = 0; i < sortedTiers.length; i++) {
      if (quantity >= sortedTiers[i].quantity) {
        pricePerPc = sortedTiers[i].price;
      } else {
        break;
      }
    }

    return (quantity * pricePerPc).toFixed(2);
  };

  const handleGuestLogin = async () => {
    setIsProcessingGuest(true);
    let uid = getUserUID();

    try {
      // If UID is not found in cookie, fetch it
      if (!uid) {
        uid = getOrCreateDeviceIdClient();
        if (!uid) {
          toast.error("Failed to generate guest session");
          return false;
        }
      }

      const payload = { uid };
      await dispatch(
        addUser({
          payload,
          onSuccess: () => {
            setUserUID(uid!);
          },
        })
      ).unwrap();

      return true;
    } catch (error) {
      console.error("Guest login failed:", error);
      toast.error("Failed to initialize guest session");
      return false;
    } finally {
      setIsProcessingGuest(false);
    }
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

    const token = getAuthToken();
    const userUID = getUserUID();

    if (!token && !userUID) {
      try {
        const guestSuccess = await handleGuestLogin();
        if (!guestSuccess) {
          return;
        }
      } catch (error) {
        console.error("Guest login error:", error);
        toast.error("Failed to setup guest account");
        return;
      }
    }

    try {
      const orderPayload = {
        productId:Number(productId),
        currency: "USD",
        isOrder: true,
        quantity,
        type: "direct",
        providerId,
      };

      const result = await dispatch(createPaymentOrder(orderPayload)).unwrap();

      if (result?.data?.result?.url) {
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

  // Set initial quantity when popular tier loads
  useEffect(() => {
    if (pricingPlans?.length > 0 && popularTier) {
      const initialTier = popularTier || pricingPlans[0];
      if (initialTier) {
        setQuantity(initialTier.quantity);
        setSelectedTier(initialTier);
      }
    }
  }, [pricingPlans, popularTier]);

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
      <h4 className="font-bold text-white text-2xl mb-6">Payment</h4>
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
                    selectedTier?.quantity === popularTier?.quantity
                      ? "border-[#13F195]"
                      : "border-transparent hover:border-green-400"
                  }`}
                  onClick={() => handleTierSelect(popularTier)}
                >
                  <div className="absolute -top-3 left-0 bg-[#13F195] text-black text-xs font-medium px-2 py-0.5 rounded-full uppercase">
                    Popular
                  </div>
                  <div className="text-white text-lg font-bold mb-1">
                    {popularTier.quantity}{" "}
                    <span className="text-sm font-medium text-gray-400">GB</span> /{" "}
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
                      selectedTier?.quantity === tier?.quantity
                        ? "border-[#13F195]"
                        : "border-transparent hover:border-green-400"
                    }`}
                  >
                    <div className="text-white text-base font-bold">
                      {tier?.quantity}{" "}
                      <span className="text-sm text-gray-400 font-medium">GB</span>
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
          !popularTier || fetchPricingPlans || isOrderPaymentLoading || isProcessingGuest || quantity === 0
        }
        className="w-full py-3 rounded-lg font-semibold text-lg bg-[#7BB9FF1A] text-[#13F195] hover:bg-[#232b3f] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessingGuest || isOrderPaymentLoading ? "Processing..." : "Buy in 1 Click"}
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
        onSuccess={onClose}
        currentPage={currentPage}
        activeTab={activeTab}
      />
    </Modal>
  );
};

export default PaymentBuyClickModal;
