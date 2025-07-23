import React, { useState } from "react";
import { Loader, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";
import { getOrCreateDeviceIdClient } from "@/utils/deviceId";
import { addUser } from "@/store/user/actions";
import { toast } from "react-toastify";
import { addToCart, getCartByUser, updateCartItem } from "@/store/bookings/actions";

interface Tier {
  isPopular: unknown;
  quantity: number;
  price: number;
}

interface PricingSelectorProps {
  productId: string;
  fetchPricingPlans: boolean;
  pricingPlans: Tier[];
  selectedTier?: Tier;
  quantity: number;
  calculateTotalPrice: () => string;
  handleTierSelect: (tier: Tier) => void;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  setIsPaymentModalOpen: (value: boolean) => void;
  otherSellers?: any[];
}

const PricingSelector: React.FC<PricingSelectorProps> = ({
  productId,
  fetchPricingPlans,
  pricingPlans,
  selectedTier,
  quantity,
  calculateTotalPrice,
  handleTierSelect,
  setQuantity,
  setIsPaymentModalOpen,
  otherSellers,
}) => {
  const dispatch = useAppDispatch();
  const { addingtoCart, updatingItem, cartItems } = useAppSelector(
    (state) => state.booking
  );
  const [isProcessingGuest, setIsProcessingGuest] = useState(false);
  const popularTier = pricingPlans?.find((tier) => tier?.isPopular);
  const otherTiers = pricingPlans?.filter((tier) => !tier?.isPopular);

  const handleGuestLogin = async () => {
    setIsProcessingGuest(true);
    try {
      let uid = getUserUID();

      if (!uid) {
        uid = getOrCreateDeviceIdClient();
        if (!uid) throw new Error("Failed to generate device ID");
      }

      const payload = { uid };
      const user = await dispatch(
        addUser({
          payload,
          onSuccess: () => {
            setUserUID(uid);
          },
        })
      ).unwrap();

      return user?.data;
    } catch (error) {
      console.error("Guest login failed:", error);
      toast.error("Failed to setup guest session");
      throw error;
    } finally {
      setIsProcessingGuest(false);
    }
  };
  const handleAddToCart = async () => {
    const token = getAuthToken();
    const userUID = getUserUID();

    if (!token && !userUID) {
      try {
        await handleGuestLogin();
      } catch (error) {
        console.error("Guest login failed:", error);
        return;
      }
    }
    const existingItem = cartItems.find((item) => item?.Product?.id == productId);

    try {
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        await dispatch(
          updateCartItem({
            id: existingItem.id,
            data: {
              quantity: newQuantity,
            },
          })
        ).unwrap();
        toast.success("Cart item updated!");
      } else {
        await dispatch(
          addToCart({
            productId: Number(productId),
            quantity,
            providerId: otherSellers?.[0]?.id,
          })
        ).unwrap();
      }
      dispatch(getCartByUser());
    } catch (error: any) {
      console.error(error?.message || "Failed to update cart");
    }
  };

  return (
    <div className="bg-[#090E15] p-6 rounded-xl text-white font-sans">
      {fetchPricingPlans ? (
        <>
          <div className="bg-[#1A1F2B] animate-pulse rounded-lg h-20 mb-5 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-[#1A1F2B] rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#1A1F2B] rounded animate-pulse" />
              <div className="w-20 h-10 bg-[#1A1F2B] rounded animate-pulse" />
              <div className="w-8 h-8 bg-[#1A1F2B] rounded animate-pulse" />
            </div>
            <div className="w-24 h-6 bg-[#1A1F2B] rounded animate-pulse" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 h-10 bg-[#1A1F2B] rounded animate-pulse" />
            <div className="flex-1 h-10 bg-[#1A1F2B] rounded animate-pulse" />
          </div>
        </>
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
                {popularTier?.quantity}{" "}
                <span className="text-sm font-medium text-gray-400">GB</span> /{" "}
                <span className="text-lg font-medium text-[#13F195]">
                  ${popularTier?.price?.toFixed(1)}
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
          <div className="flex items-center justify-between mb-5 flex-wrap gap-y-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-700 rounded text-lg text-[#7A8895]"
              >
                −
              </button>
              <input
                type="text"
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
                className="w-20 text-center bg-gray-700 rounded text-lg text-white px-2 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-[#13F195]"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 bg-gray-700 rounded text-lg text-[#7A8895]"
              >
                +
              </button>
            </div>
            <div className="text-[#13F195] text-lg font-semibold">
              ${calculateTotalPrice()}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className={`flex-1 flex items-center justify-center gap-2 bg-[#13F195] hover:bg-[#0ddb7f]
           text-black font-semibold py-2 rounded transition-all ${
             addingtoCart ? "opacity-70 cursor-not-allowed" : ""
           }`}
              disabled={
                addingtoCart || updatingItem || quantity === 0 || isProcessingGuest
              }
              onClick={handleAddToCart}
            >
              {addingtoCart || updatingItem || isProcessingGuest ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  Adding...
                </>
              ) : (
                <>
                  Add to <ShoppingCart size={16} />
                </>
              )}
            </button>
            <button
              className="flex-1 bg-[#7BB9FF1A] font-semibold py-2 rounded hover:bg-[#232b3f] transition-all"
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={addingtoCart || updatingItem || quantity === 0}
            >
              Buy in 1 click
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PricingSelector;
