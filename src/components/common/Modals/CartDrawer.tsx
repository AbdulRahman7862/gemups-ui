import React, { useEffect, useState, useCallback, useRef } from "react";
import { X, Trash, Loader } from "lucide-react";
import Image from "next/image";
import {
  createPaymentOrder,
  deleteCartItem,
  getCartByUser,
  updateCartItem,
  checkOrderStatus,
  getOrdersByUser,
  guestPayWithWallet,
} from "@/store/bookings/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { updateCartItemLocally } from "@/store/bookings/bookingSlice";
import { getAuthToken } from "@/utils/authCookies";
import PaymentModal from "./PaymentModal";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const dispatch = useAppDispatch();
  const drawerRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.user);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const {
    cartItems,
    fetchingItems,
    deletingItem,
    updatingItem,
    placingOrder,
    isOrderPaymentLoading,
    checkingOrderStatus,
  } = useAppSelector((state) => state.booking);
  const total = cartItems?.reduce((acc, item) => acc + (item.amount || 0), 0) || 0;

  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const DEBOUNCE_DELAY = 1000;
  const fetchCartDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch for cart items
  const fetchCartItemsDebounced = useCallback(() => {
    if (fetchCartDebounceRef.current) {
      clearTimeout(fetchCartDebounceRef.current);
    }
    fetchCartDebounceRef.current = setTimeout(() => {
      dispatch(getCartByUser());
    }, 300);
  }, [dispatch]);

  const handleDeleteItem = async (id: string) => {
    setDeletingItemId(id);
    try {
      await dispatch(deleteCartItem(id));
      dispatch(getCartByUser());
    } finally {
      setDeletingItemId(null);
    }
  };

  const calculatePriceAndAmount = (item: any, newQuantity: number) => {
    const applicableTiers =
      item.pricing
        ?.slice()
        .sort(
          (a: { quantity: number }, b: { quantity: number }) => a.quantity - b.quantity
        ) || [];

    let pricePerPc = applicableTiers[0]?.price || 0;

    for (let i = 0; i < applicableTiers.length; i++) {
      if (newQuantity >= applicableTiers[i].quantity) {
        pricePerPc = applicableTiers[i].price;
      } else {
        break;
      }
    }

    const newAmount = parseFloat((pricePerPc * newQuantity).toFixed(2));
    return { pricePerPc, newAmount };
  };

  const debouncedUpdateCartItem = useCallback(
    (id: string, quantity: number, amount: number) => {
      if (debounceTimers.current[id]) {
        clearTimeout(debounceTimers.current[id]);
      }

      debounceTimers.current[id] = setTimeout(async () => {
        try {
          await dispatch(
            updateCartItem({
              id,
              data: {
                quantity,
              },
            })
          ).unwrap();
        } catch (error) {
          toast.error("Failed to update item quantity.");
        } finally {
          // Always refresh the cart from backend after update
          dispatch(getCartByUser());
        }
        delete debounceTimers.current[id];
      }, DEBOUNCE_DELAY);
    },
    [dispatch]
  );

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find((c) => c.id === id);
    if (!item) return;

    // Use the stored tier information from when the item was added to cart
    const pricePerPc = item.price || item.tier?.price || 0;
    const newAmount = parseFloat((pricePerPc * newQuantity).toFixed(2));

    // Update locally for instant UI feedback
    dispatch(updateCartItemLocally({ id, quantity: newQuantity, amount: newAmount }));

    // Show loader for this item
    setUpdatingItemId(id);

    // Debounced backend update
    debouncedUpdateCartItem(id, newQuantity, newAmount);
  };

  const handleInputQuantityChange = (id: string, value: string) => {
    const item = cartItems.find((c) => c.id === id);
    if (!item) return;

    if (value === "") {
      const pricePerPc = item.price || item.tier?.price || 0;
      const newAmount = parseFloat((pricePerPc * 1).toFixed(2));
      dispatch(updateCartItemLocally({ id, quantity: 1, amount: newAmount }));
      debouncedUpdateCartItem(id, 1, newAmount);
      return;
    }

    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      const pricePerPc = item.price || item.tier?.price || 0;
      const newAmount = parseFloat((pricePerPc * numValue).toFixed(2));
      dispatch(updateCartItemLocally({ id, quantity: numValue, amount: newAmount }));
      debouncedUpdateCartItem(id, numValue, newAmount);
    }
  };

  const handlePayment = async () => {
    if (!cartItems?.length) {
      return toast.warning("No items in cart to purchase.");
    }

    console.log("DEBUG: Starting payment process for cart items:", cartItems);

    // Clear any old pending order before starting new payment
    localStorage.removeItem("pendingOrderId");

    try {
      // Ensure we create only one order with the correct quantity
      const cartItem = cartItems[0];
      
      // Check if user is guest and use appropriate payment method
      if (user?.isGuest) {
        console.log('DEBUG: Guest user cart payment');
        
        // For guest cart payment, we need to send cart items in the format the backend expects
        const cartItemForPayment = {
          productId: String(cartItem?.Product?.id),
          quantity: Number(cartItem.quantity),
          providerId: String(cartItem.providerId),
          price: cartItem.amount || (cartItem.tier?.price * cartItem.quantity),
          type: "cart",
          // Include tier information from cart item
          userDataAmount: cartItem.tier?.userDataAmount || cartItem.userDataAmount || 1,
          unit: cartItem.tier?.unit || cartItem.unit || 'GB',
          tierId: cartItem.tierId || `${cartItem.userDataAmount || 1}-${cartItem.unit || 'GB'}`,
          isPopular: cartItem.tier?.isPopular || cartItem.isPopular || false,
          // Additional fields that might be needed
          shop: "default",
          un_flow: cartItem.tier?.userDataAmount || cartItem.userDataAmount || 1,
          un_flow_used: 0,
          expire: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days
        };

        const guestWalletPayload = {
          // Include fields at root level for validation
          productId: String(cartItem?.Product?.id),
          quantity: Number(cartItem.quantity),
          providerId: String(cartItem.providerId),
          type: "cart",
          // Include cart array for processing
          cart: [cartItemForPayment]
        };

        console.log("DEBUG: Guest cart payment payload:", guestWalletPayload);
        console.log("DEBUG: Cart item being sent:", cartItemForPayment);
        console.log("DEBUG: Original cart item:", cartItem);

        const result = await dispatch(guestPayWithWallet(guestWalletPayload)).unwrap();
        
        if (result.success) {
          console.log('DEBUG: Guest cart payment successful:', result);
          toast.success("Cart payment completed successfully!");
          dispatch(getCartByUser());
          onClose();
        } else {
          toast.error(result.error || "Guest cart payment failed.");
        }
      } else {
        // Regular user cart payment (existing logic)
        console.log('DEBUG: Regular user cart payment');
        
        const paymentPayload = {
          productId: Number(cartItem?.Product?.id),
          currency: "USD",
          isOrder: true,
          quantity: cartItem.quantity, // This should be the quantity within one order
          type: "cart",
          providerId: cartItem.providerId,
          // Add additional fields to ensure single order creation
          createSingleOrder: true,
          orderCount: 1,
        };

        console.log("DEBUG: Regular cart payment payload:", paymentPayload);

        const result = await dispatch(
          createPaymentOrder(paymentPayload)
        ).unwrap();
        
        console.log("DEBUG: Payment order created successfully:", result);
        
        if (result?.data?.result?.url) {
          // Store order_id for status checking when user returns
          localStorage.setItem("pendingOrderId", result.data.result.order_id);
          console.log("DEBUG: Stored order_id and redirecting to:", result.data.result.url);
          window.location.href = result.data.result.url;
        } else {
          throw new Error("Payment URL not found in response");
        }

        dispatch(getCartByUser());
        onClose();
      }
    } catch (error: any) {
      console.error("DEBUG: Payment failed:", error);
      toast.error(error?.message || "Order failed. Please try again.");
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    if (isOpen) {
      fetchCartItemsDebounced();
    }
  }, [isOpen, dispatch, fetchCartItemsDebounced]);

  // Check for pending orders when component mounts
  useEffect(() => {
    const checkPendingOrder = async () => {
      const pendingOrderId = localStorage.getItem("pendingOrderId");
      if (!pendingOrderId) return;
      
      // Validate order_id format - should not contain invalid characters or be too long
      if (pendingOrderId.includes('<!DOCTYPE') || 
          pendingOrderId.includes('<html>') || 
          pendingOrderId.includes('Error') ||
          pendingOrderId.includes('Cannot GET') ||
          pendingOrderId.length > 100 ||
          pendingOrderId.includes('\n')) {
        localStorage.removeItem("pendingOrderId");
        return;
      }
      
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
      } catch (error: any) {
        // Silently clear localStorage for any error - no console logs
        localStorage.removeItem("pendingOrderId");
      }
    };
    
    checkPendingOrder();
  }, [dispatch]);

  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

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

  // Clear loader when backend update is done
  useEffect(() => {
    if (!updatingItem) {
      setUpdatingItemId(null);
    }
  }, [updatingItem]);

  return (
    <>
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#090E15] text-white shadow-lg transform transition-transform duration-300 z-[5000000] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#1E2836]">
          <h2 className="text-2xl font-bold">
            Cart <span className="text-[#7A8895]">{cartItems?.length}</span>
          </h2>
          <button onClick={onClose}>
            <X className="text-white hover:text-red-400" />
          </button>
        </div>
        <div className="px-4 py-2 overflow-y-auto h-[calc(100%-210px)]">
          {fetchingItems ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="h-6 w-6 animate-spin text-[#13F195]" />
            </div>
          ) : cartItems?.length ? (
            cartItems.map((item) => {
              const key = item?.id || item?._id || item?.productId;
              const imageSrc = item?.Product?.image;
              const imageAlt = item?.Product?.name || 'Cart item';
              return (
                <div
                  key={key}
                  className="bg-[#0E1118] p-4 rounded-lg mb-4 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-4">
                    {imageSrc && imageSrc !== "" ? (
                      <Image
                        src={imageSrc}
                        alt={imageAlt}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                    <Image
                        src="/images/logo/icon.png"
                        alt={imageAlt}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    )}
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="inline-block bg-[#13F1951A] px-2 py-1.5 rounded-lg text-xs">
                          <span className="font-bold text-[#13F195] mr-1">
                            {item?.Product?.type}
                          </span>
                          <span className="text-[#7A8895]">{item?.Product?.name}</span>
                        </span>
                      </div>
                      <p className="text-white text-sm leading-snug mb-2">
                        {item?.Product?.features?.join(" | ")}
                      </p>
                      {/* Display tier information */}
                      {item?.userDataAmount && item?.unit && (
                        <div className="mb-2">
                          <span className="inline-block bg-[#7BB9FF1A] px-2 py-1 rounded text-xs">
                            <span className="font-bold text-[#7BB9FF] mr-1">
                              {item.userDataAmount} {item.unit}
                            </span>
                            <span className="text-[#7A8895]">
                              {item.isPopular ? " (Popular)" : ""}
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            className="w-7 h-7 rounded-full bg-[#1B222D] text-white"
                            onClick={() =>
                              handleQuantityChange(item?.id, item?.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <input
                            value={item?.quantity}
                            type="text"
                            inputMode="numeric"
                            onChange={(e) => {
                              handleInputQuantityChange(item?.id, e.target.value);
                            }}
                            className="w-20 text-center bg-gray-700 rounded text-lg text-white px-2 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-[#13F195]"
                          />
                          <button
                            className="w-7 h-7 rounded-full bg-[#1B222D] text-white"
                            onClick={() =>
                              handleQuantityChange(item?.id, item?.quantity + 1)
                            }
                            disabled={updatingItem}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-[16px] font-semibold text-[#13F195] whitespace-nowrap">
                            {updatingItemId === item.id ? (
                              <Loader className="h-4 w-4 animate-spin text-[#13F195]" />
                            ) : (
                              `$${item?.amount?.toLocaleString()}`
                            )}
                          </p>
                          {item?.tier?.price && (
                            <p className="text-xs text-[#7A8895] whitespace-nowrap">
                              ${item.tier.price} per {item?.unit || 'unit'}
                            </p>
                          )}
                        </div>
                        <button
                          className="text-gray-400 hover:text-red-400 w-7 h-7 flex items-center justify-center transition"
                          onClick={() => handleDeleteItem(item?.id)}
                          aria-label="Delete item"
                          disabled={deletingItem}
                        >
                          {deletingItemId === item.id ? (
                            <Loader className="h-4 w-4 animate-spin text-[#13F195]" />
                          ) : (
                            <Trash size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-sm text-gray-500 py-10">
              No items in cart
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 w-full px-4 py-4 bg-[#0E1118] border-t border-[#1E2836]">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter promo code (stage 3)"
              className="w-full bg-[#7BB9FF0D] text-white placeholder:text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13F195]"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-4">
            <div className="text-white font-semibold text-[16px]">
              For Payment: {" "}
              <div className="text-[#13F195] text-2xl font-semibold flex items-center gap-2">
                ${total?.toFixed(2)}
                {(updatingItemId || updatingItem) && (
                  <Loader className="h-5 w-5 animate-spin text-[#13F195]" />
                )}
              </div>
            </div>
            <button
              className="bg-[#13F195] text-black font-semibold px-8 py-4 hover:bg-[#0ddb7f] rounded-lg w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={placingOrder}
            >
              {isOrderPaymentLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                "Place an order"
              )}
            </button>
          </div>
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        productId={cartItems?.[0]?.Product?.id || ""}
        providerId={cartItems?.[0]?.providerId || ""}
        quantity={cartItems?.[0]?.quantity || 1}
        totalPrice={cartItems?.[0]?.price ? (cartItems[0].price * cartItems[0].quantity).toFixed(2) : total.toFixed(2)}
        loading={isOrderPaymentLoading || placingOrder}
        type="cart"
        selectedTier={cartItems?.[0]?.tier || {
          userDataAmount: cartItems?.[0]?.userDataAmount,
          unit: cartItems?.[0]?.unit,
          price: cartItems?.[0]?.price,
          isPopular: cartItems?.[0]?.isPopular,
          quantity: cartItems?.[0]?.quantity
        }}
      />
    </>
  );
}
