import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, updateCartItem } from "@/store/bookings/actions";
import { toast } from "react-toastify";
import { getAuthToken } from "@/utils/authCookies";
import { Loader, ShoppingCart } from "lucide-react";
import { useGuestUser } from "@/hooks/useGuestUser";
import { getOrCreateDeviceIdClient } from '@/utils/deviceId';
import { getCartByUser } from "@/store/bookings/actions";

interface Tier {
  isPopular: unknown;
  quantity: number;
  price: number;
  unit: string;
  userDataAmount: number;
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
  setIsCartModalOpen?: (value: boolean) => void;
  otherSellers?: any[];
  selectedProxy?: any;
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
  setIsCartModalOpen,
  otherSellers,
  selectedProxy,
}) => {

  const dispatch = useAppDispatch();
  const { addingtoCart, updatingItem, cartItems } = useAppSelector(
    (state) => state.booking
  );
  const { initializeGuestUserForCart } = useGuestUser();

  const popularTier = pricingPlans?.find((tier) => tier?.isPopular);
  const otherTiers = pricingPlans?.filter((tier) => !tier?.isPopular);

  // Helper to get providerId using the same logic as the parent page
  const getProviderId = () => {
    let providerId = otherSellers?.[0]?.id;
    if (!providerId && selectedProxy?.providers?.[0]?.providerId) {
      providerId = selectedProxy.providers[0].providerId;
    }
    return providerId;
  };

  const providerId = getProviderId();



  const handleAddToCart = async () => {
    if (!providerId) {
      toast.error("No provider found for this product.");
      return;
    }
    
    // Check if user needs guest user initialization
    const token = getAuthToken();
    if (!token) {
      try {
        // Initialize guest user when adding to cart
        await initializeGuestUserForCart();
        toast.success("Guest session created! You can now add items to cart.");
      } catch (error) {
        toast.error("Failed to create guest session. Please try again.");
        return;
      }
    }
    
    // Debug: Log the first cart item structure to understand the data format
    if (cartItems && cartItems.length > 0) {
      console.log('DEBUG: First cart item structure:', JSON.stringify(cartItems[0], null, 2));
    }
    
    // Create a unique identifier for the cart item
    const currentTierId = `${selectedTier?.userDataAmount}-${selectedTier?.unit}`;
    
    console.log('DEBUG: Current cart items:', cartItems);
    console.log('DEBUG: Looking for existing item with:', {
      productId: String(productId),
      providerId: String(providerId),
      tierId: currentTierId
    });
    
    // Find existing item with the same product, provider, and tier
    const existingItem = cartItems.find((item) => {
      // Get the product ID from the item - try multiple possible locations
      const itemProductId = String(item?.Product?.id || item?.productId || item?.ProductId);
      const itemProviderId = String(item?.providerId || item?.ProviderId);
      
      // Get tier ID from the item - try multiple possible locations
      const itemTierId = item?.tierId || 
                        `${item?.userDataAmount}-${item?.unit}` || 
                        `${item?.tier?.userDataAmount}-${item?.tier?.unit}`;
      
      const isMatch = itemProductId === String(productId) && 
                     itemProviderId === String(providerId) &&
                     itemTierId === currentTierId;
      
      console.log('DEBUG: Checking item:', {
        itemId: item?.id || item?._id,
        itemProductId,
        itemProviderId,
        itemTierId,
        currentTierId,
        productIdMatch: itemProductId === String(productId),
        providerIdMatch: itemProviderId === String(providerId),
        tierIdMatch: itemTierId === currentTierId,
        isMatch
      });
      
      return isMatch;
    });

    // Debug log for addToCart params
    const addToCartPayload = {
      productId: String(productId),
      quantity: Number(quantity),
      providerId: String(providerId),
      userDataAmount: selectedTier?.userDataAmount || 1,
      unit: selectedTier?.unit || 'GB',
      price: selectedTier?.price || 0,
      tierId: currentTierId, // Unique identifier for the tier
      isPopular: selectedTier?.isPopular || false,
      // Include the full tier information for proper display
      tier: {
        userDataAmount: selectedTier?.userDataAmount,
        unit: selectedTier?.unit,
        price: selectedTier?.price,
        isPopular: selectedTier?.isPopular,
        quantity: selectedTier?.quantity
      },
      // Add user_uid if available
      ...(typeof window !== 'undefined' && localStorage.getItem('user_uid') ? { user_uid: localStorage.getItem('user_uid') } : {})
    };
    console.log('DEBUG addToCart payload:', addToCartPayload);
    console.log('DEBUG existing item found:', existingItem);

    try {
      if (existingItem) {
        console.log('DEBUG: Updating existing cart item:', existingItem.id || existingItem._id, 'with new quantity:', existingItem.quantity + quantity);
        const newQuantity = existingItem.quantity + quantity;

        const result = await dispatch(
          updateCartItem({
            id: existingItem.id || existingItem._id,
            data: {
              quantity: newQuantity,
            },
          })
        ).unwrap();
        console.log('DEBUG: Update cart result:', result);
        toast.success("Cart updated successfully!");
      } else {
        console.log('DEBUG: Adding new cart item');
        const result = await dispatch(addToCart(addToCartPayload)).unwrap();
        console.log('DEBUG: Add to cart result:', result);
        toast.success("Added to cart successfully!");
      }

      // Open cart drawer instead of payment modal
      if (setIsCartModalOpen) {
        setIsCartModalOpen(true);
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="bg-[#090E15] p-6 rounded-xl text-white font-sans">
      {/* Current Provider Display */}
      {selectedProxy?.providers?.[0]?.providerId && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">Current provider:</span>
            <span className="text-sm font-medium text-white">
              {selectedProxy.providers[0].providerId}
            </span>
          </div>
        </div>
      )}
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
                {popularTier?.userDataAmount}{" "}
                <span className="text-sm font-medium text-gray-400">{popularTier?.unit}</span> /{" "}
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
                  {tier?.userDataAmount}{" "}
                  <span className="text-sm text-gray-400 font-medium">{tier?.unit}</span>
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
                    if (selectedTier && value > selectedTier.quantity) {
                      toast.error(`Available amount for this in stock is ${selectedTier.quantity}`);
                      setQuantity(selectedTier.quantity);
                      return;
                    }
                    setQuantity(value);
                  }
                }}
                className="w-20 text-center bg-gray-700 rounded text-lg text-white px-2 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-[#13F195]"
              />
              <button
                onClick={() => {
                  const newQuantity = quantity + 1;
                  if (selectedTier && newQuantity > selectedTier.quantity) {
                    toast.error(`Available amount for this in stock is ${selectedTier.quantity}`);
                    return;
                  }
                  setQuantity(newQuantity);
                }}
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
                addingtoCart || updatingItem || quantity === 0 || !providerId
              }
              onClick={handleAddToCart}
            >
              {addingtoCart || updatingItem ? (
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
