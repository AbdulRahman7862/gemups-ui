import { Modal } from "@/components/ui/modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createPaymentOrder, createProxyOrder, checkOrderStatus, getOrdersByUser, getCartByUser, guestPayWithWallet } from "@/store/bookings/actions";
import { getAuthToken } from "@/utils/authCookies";
import { getUserBalance } from "@/store/user/actions";
import { updateWalletBalance } from "@/store/user/userSlice";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PROXY_EXPIRE_DAYS, PROXY_HOST } from "@/helpers/const";


interface PaymentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  productId: string;
  providerId: string;
  quantity: number;
  totalPrice?: string;
  loading?: boolean;
  type?: string;
  orderId?: string;
  onSuccess?: () => void;
  currentPage?: number;
  activeTab?: string;
  selectedTier?: { quantity: number; price: number; isPopular?: boolean; unit: string; userDataAmount: number };
  isProlong?: boolean;
}

// Utility function to calculate flow in bytes based on unit
const calculateFlowInBytes = (amount: number, unit: string, quantity: number = 1) => {
  const unitUpper = unit.toUpperCase();
  
  if (unitUpper === 'GB') {
    return (amount * 1024 * 1024 * 1024) * quantity;
  } else if (unitUpper === 'MB') {
    return (amount * 1024 * 1024) * quantity;
  } else if (unitUpper === 'KB') {
    return (amount * 1024) * quantity;
  } else {
    // Default to bytes
    return amount * quantity;
  }
};

export default function PaymentModal({
  isOpen = true,
  onClose,
  productId,
  providerId,
  quantity,
  totalPrice,
  loading,
  type,
  orderId,
  onSuccess,
  currentPage,
  activeTab,
  selectedTier,
  isProlong = false,
  unit = 'GB', // Add a prop or infer from selectedTier if available
}: PaymentModalProps & { unit?: 'GB' | 'MB' }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("cryptomus");
  const { walletBalance, user } = useAppSelector((state) => state.user);
  const { checkingOrderStatus } = useAppSelector((state) => state.booking);
  const [isProcessingGuest, setIsProcessingGuest] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);

  const handleCancel = () => {
    onClose?.();
  };

  const handlePayment = async () => {
    try {
      if (!productId || !quantity || !providerId) {
        toast.error("Missing order information.");
        return;
      }

      // Check if user is authenticated
      const token = getAuthToken();
      if (!token) {
        toast.error("Please login or register to continue with payment");
        return;
      }

      console.log('DEBUG: User is authenticated, token exists');
      console.log('DEBUG: Selected payment method:', selectedMethod);

      // Clear any old pending order before starting new payment
      localStorage.removeItem("pendingOrderId");

      if (selectedMethod === "cryptomus") {
        // Handle Cryptomus payment
        console.log('DEBUG: Starting Cryptomus payment process');

        const orderPayload = {
          productId: String(productId),
          currency: "USD",
          isOrder: true,
          quantity: Number(quantity),
          type: type || "direct",
          providerId: String(providerId),
          // Add additional fields to ensure single order creation
          createSingleOrder: true,
          orderCount: 1,
          // Add prolong-specific fields
          ...(isProlong && orderId && {
            isProlong: true,
            existingOrderId: orderId
          })
        };

        console.log('DEBUG: Cryptomus orderPayload:', orderPayload);

        setIsWalletLoading(true);
        try {
          const result = await dispatch(createPaymentOrder(orderPayload)).unwrap();
          
          console.log('DEBUG: Cryptomus payment order created successfully:', result);

          if (result?.data?.result?.url) {
            // Store order_id for status checking when user returns
            localStorage.setItem("pendingOrderId", result.data.result.order_id);
            console.log('DEBUG: Stored order_id and redirecting to:', result.data.result.url);
            window.location.href = result.data.result.url;
          } else {
            throw new Error("Payment URL not found in response");
          }

          onClose?.();
        } catch (err: any) {
          console.error('DEBUG: Cryptomus payment failed:', err);
          if (err?.error) {
            toast.error(err.error);
          } else {
            toast.error(err.message || "Cryptomus payment creation failed.");
          }
        } finally {
          setIsWalletLoading(false);
        }
      } else if (selectedMethod === "wallet") {
        // Handle wallet payment
        console.log('DEBUG: Starting wallet payment process');

        // Check if user is guest and use appropriate payment method
        if (user?.isGuest) {
          console.log('DEBUG: Guest user wallet payment');
          
          // For guest wallet payment, we need to send cart items in the format the backend expects
          const cartItem = {
            productId: String(productId),
            quantity: Number(quantity),
            providerId: String(providerId),
            price: selectedTier ? selectedTier.price * quantity : Number(totalPrice),
            type: type || "direct",
            // Include tier information for backend processing
            userDataAmount: selectedTier?.userDataAmount || 1,
            unit: selectedTier?.unit || 'GB',
            tierId: selectedTier ? `${selectedTier.userDataAmount}-${selectedTier.unit}` : '1-GB',
            isPopular: selectedTier?.isPopular || false,
            // Additional fields that might be needed
            shop: "default",
            un_flow: selectedTier?.userDataAmount || 1,
            un_flow_used: 0,
            expire: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60), // 90 days
          };

          const guestWalletPayload = {
            // Include fields at root level for validation
            productId: String(productId),
            quantity: Number(quantity),
            providerId: String(providerId),
            type: type || "direct",
            // Include cart array for processing
            cart: [cartItem],
            // Add prolong-specific fields
            ...(isProlong && orderId && {
              isProlong: true,
              existingOrderId: orderId,
              // Add flow and expire values for prolong flows
              flow: calculateFlowInBytes(
                selectedTier?.userDataAmount || 1,
                selectedTier?.unit || unit,
                quantity
              ).toString(),
              expire: (Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)).toString() // 90 days from now
            })
          };

          console.log('DEBUG: Guest wallet payment payload:', guestWalletPayload);
          console.log('DEBUG: Cart item being sent:', cartItem);
          console.log('DEBUG: Selected tier being used:', selectedTier);
          console.log('DEBUG: Calculated amount:', selectedTier ? selectedTier.price * quantity : Number(totalPrice));

          setIsWalletLoading(true);
          try {
            const response = await dispatch(guestPayWithWallet(guestWalletPayload)).unwrap();
            
            if (response.success) {
              console.log('DEBUG: Guest wallet payment successful:', response);
              console.log('DEBUG: Remaining balance:', response.walletBalance);
              console.log('DEBUG: Proxy details:', response.order?.proxyDetails);
              
              // Update wallet balance immediately with the response data
              if (response.walletBalance !== undefined) {
                dispatch(updateWalletBalance(response.walletBalance));
              } else {
                // Fallback to fetching balance from server
                dispatch(getUserBalance());
              }
              
              // Clear cart if it was a cart purchase
              if (type === "cart") {
                dispatch(getCartByUser());
              }
              
              // Refresh orders
              await dispatch(
                getOrdersByUser({
                  page: currentPage || 1,
                  limit: 10,
                  type: activeTab || 'all',
                })
              );
              
              onClose?.();
              router.push("/purchases");
              onSuccess?.();
            } else {
              toast.error(response.error || "Guest wallet payment failed.");
            }
          } catch (err: any) {
            console.error('DEBUG: Guest wallet payment failed:', err);
            if (err?.error) {
              toast.error(err.error);
            } else {
              toast.error(err.message || "Guest wallet payment failed.");
            }
          } finally {
            setIsWalletLoading(false);
          }
        } else {
          // Regular user wallet payment (existing logic)
          console.log('DEBUG: Regular user wallet payment');
          
          // Calculate expire and flow for proxy creation
          const expire = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 days
          const flow = calculateFlowInBytes(
            selectedTier?.userDataAmount || 1,
            selectedTier?.unit || unit,
            quantity
          );
          
          const amount = selectedTier ? selectedTier.price * quantity : Number(totalPrice);

          // Calculate flow and expire values
          const calculatedFlow = calculateFlowInBytes(
            selectedTier?.userDataAmount || 1,
            selectedTier?.unit || unit,
            quantity
          );
          
          const calculatedExpire = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 days

          const orderData = {
            expire: calculatedExpire.toString(),
            flow: calculatedFlow.toString(),
            host: "128.14.70.10", // Use the host from your constants
            productId,
            providerId,
            amount,
            // Add prolong-specific fields
            ...(isProlong && orderId && {
              isProlong: true,
              existingOrderId: orderId
            })
          };

          console.log('DEBUG: Regular wallet orderData:', orderData);
          console.log('DEBUG: isProlong flag:', isProlong);
          console.log('DEBUG: existingOrderId:', orderId);
          console.log('DEBUG: Full payload being sent:', JSON.stringify(orderData, null, 2));

          setIsWalletLoading(true);
          try {
            const response = await dispatch(createProxyOrder(orderData)).unwrap();
            if (response.success) {
              toast.success("Proxy order created and paid successfully!");
              dispatch(getUserBalance());
              dispatch(getCartByUser());
              onClose?.();
              router.push("/purchases");
              if (type === "cart") {
                dispatch(getCartByUser());
              }
              if (orderId) {
                await dispatch(
                  getOrdersByUser({
                    page: currentPage,
                    limit: 10,
                    type: activeTab,
                  })
                );
                onSuccess?.();
              }
            } else {
              toast.error(response.error || "Proxy order creation failed.");
            }
          } catch (err: any) {
            console.error('DEBUG: Regular wallet payment failed:', err);
            if (err?.error) {
              toast.error(err.error);
            } else {
              toast.error(err.message || "Wallet payment failed.");
            }
          } finally {
            setIsWalletLoading(false);
          }
        }
      }
    } catch (error: any) {
      console.error('DEBUG: Payment process failed:', error);
      toast.error(error?.message || "Payment process failed.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const token = getAuthToken();
    if (!token) return;
    dispatch(getUserBalance());
  }, [dispatch, isOpen]);

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
          onClose?.();
        } else if (result.success && result.data.status === 'failed') {
          // Order failed
          localStorage.removeItem("pendingOrderId");
          toast.error("Payment failed. Please try again.");
        } else if (result.success && result.data.status === 'pending') {
          // Order is still pending - this is normal, don't show any message
        } else {
          // Unknown status or error - clear the old order_id
          localStorage.removeItem("pendingOrderId");
        }
      } catch (error: any) {
        // Silently clear localStorage for any error - no console logs
        localStorage.removeItem("pendingOrderId");
      }
    };
    
    checkPendingOrder();
  }, [dispatch, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      className="max-w-[700px] bg-[#090E15] p-6 rounded-xl z-100"
    >
      <h4 className="font-bold text-white text-[24px] mb-6">Payment</h4>
      <p className="text-white mb-6">
        You are going to pay <span className="font-semibold">{totalPrice}$</span>
      </p>
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedMethod("cryptomus")}
            className={`flex items-center gap-4 p-4 rounded-lg transition ${
              selectedMethod === "cryptomus"
                ? "border-[#13F195] border-2"
                : "bg-[#1E2836] hover:bg-[#2C3A4D]"
            }`}
          >
            <div className="flex-1 text-left">
              <h6
                className={
                  selectedMethod === "cryptomus" ? "text-white" : "text-[#7A8895]"
                }
              >
                Cryptomus
              </h6>
            </div>
          </button>
          <button
            disabled={Number(walletBalance) === 0}
            onClick={() => {
              setSelectedMethod("wallet");
              if (Number(walletBalance) < Number(totalPrice)) {
                toast.error("Not enough balance for this purchase.");
              }
            }}
            className={`flex items-center gap-4 p-4 rounded-lg transition relative ${
              selectedMethod === "wallet"
                ? "border-[#13F195] border-2"
                : "bg-[#1E2836] hover:bg-[#2C3A4D]"
            } ${Number(walletBalance) === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex-1 text-left">
              <h6
                className={selectedMethod === "wallet" ? "text-white" : "text-[#7A8895]"}
              >
                Balance
              </h6>
            </div>
            {Number(walletBalance) === 0 && (
              <span className="absolute top-[-10px] right-0 bg-red-400 text-black text-xs px-2 py-0.5 rounded-full">
                Not enough balance
              </span>
            )}
          </button>
          {/* Disabled payment methods */}
          {[
            { name: "CustomPay", comingSoon: true },
            { name: "Stripe (Card)", comingSoon: true },
          ].map(({ name }) => (
            <button
              key={name}
              disabled
              className="flex items-center gap-4 p-4 bg-[#1E2836] rounded-lg opacity-50 relative"
            >
              <div className="flex-1 text-left">
                <h6 className="text-[#7A8895]">{name}</h6>
              </div>
              <span className="absolute top-[-10px] right-0 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </button>
          ))}
        </div>
        <div className="text-white mt-4">
          <span>Total:</span>{" "}
          <span className="font-semibold text-[#13F195] text-xl">{totalPrice}$</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={handleCancel}
          className="flex-1 py-3 bg-[#1E2836] text-[#7A8895] rounded-lg font-medium hover:bg-[#2C3A4D] transition"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={
            loading ||
            isProcessingGuest ||
            (selectedMethod === "wallet" && ((Number(walletBalance ?? 0) < Number(totalPrice)) || isWalletLoading))
          }
          aria-busy={loading}
          className={`flex-1 py-3 bg-[#13F195] text-black font-semibold rounded-lg hover:bg-[#0ddb7f] transition flex items-center justify-center gap-2 ${
            loading ||
            isProcessingGuest ||
            (selectedMethod === "wallet" && ((Number(walletBalance ?? 0) < Number(totalPrice)) || isWalletLoading))
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading || isProcessingGuest || (selectedMethod === "wallet" && isWalletLoading) ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : selectedMethod === "wallet" ? (
            <>Pay with Balance ({Number(walletBalance ?? 0).toFixed(2)}$)</>
          ) : (
            "Proceed to the Payment"
          )}
        </button>
      </div>
    </Modal>
  );
}
