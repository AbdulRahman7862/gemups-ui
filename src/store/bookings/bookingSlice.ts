import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  addToCart,
  createPayment,
  createPaymentOrder,
  deleteCartItem,
  getCartByUser,
  getOrderById,
  getOrdersByUser,
  placeOrder,
  placeMultipleCartOrders,
  updateCartItem,
  getProxyOrderDetails,
  prolongProxyOrder,
  checkOrderStatus,
  guestPayWithWallet,
} from "./actions";

interface CartState {
  cartItems: any[];
  orders: any[];
  order: any;
  ordersPagination: any;
  addingtoCart: boolean;
  fetchingItems: boolean;
  deletingItem: boolean;
  updatingItem: boolean;
  placingOrder: boolean;
  fetchingOrders: boolean;
  isLoading: boolean;
  isCreatePaymentLoading: boolean;
  isOrderPaymentLoading: boolean;
  orderLoading: boolean;
  proxyOrderLoading: boolean;
  prolongingOrder: boolean;
  checkingOrderStatus: boolean;
  error: string | null;
}

const initialState: CartState = {
  cartItems: [],
  orders: [],
  order: null,
  ordersPagination: {},
  addingtoCart: false,
  updatingItem: false,
  fetchingItems: false,
  deletingItem: false,
  placingOrder: false,
  fetchingOrders: false,
  isLoading: false,
  isCreatePaymentLoading: false,
  isOrderPaymentLoading: false,
  orderLoading: false,
  proxyOrderLoading: false,
  prolongingOrder: false,
  checkingOrderStatus: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    updateCartItemLocally: (state, action) => {
      const { id, quantity, amount } = action.payload;
      const item = state.cartItems.find((i) => i.id === id);
      if (item) {
        item.quantity = quantity;
        item.amount = amount;
      }
    },

    resetBookingSlice: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    // Add to Cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.addingtoCart = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.addingtoCart = false;
        // Use the updated cart data from the response
        if (action.payload?.updatedCart?.data) {
          state.cartItems = action.payload.updatedCart.data;
        }
      })
      .addCase(addToCart.rejected, (state, action: PayloadAction<any>) => {
        state.addingtoCart = false;
        state.error = action.payload;
        toast.error(action.payload || "Add to cart failed");
      });
    // Get Cart by User ID (All items)
    builder
      .addCase(getCartByUser.pending, (state) => {
        state.fetchingItems = true;
      })
      .addCase(getCartByUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.fetchingItems = false;
        state.cartItems = action.payload.data || [];
      })
      .addCase(getCartByUser.rejected, (state, action: PayloadAction<any>) => {
        state.fetchingItems = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch user cart");
      });
    // Delete Cart Item
    builder
      .addCase(deleteCartItem.pending, (state) => {
        state.deletingItem = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.deletingItem = false;
        const deletedId = action.meta.arg;
        state.cartItems = state.cartItems.filter((item) => (item.id || item._id) !== deletedId);
        toast.success("Item removed from cart");
      })
      .addCase(deleteCartItem.rejected, (state, action: PayloadAction<any>) => {
        state.deletingItem = false;
        state.error = action.payload;
        toast.error(action.payload || "Delete failed");
      });
    // Update Cart Item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.updatingItem = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.updatingItem = false;
        // Use the updated cart data from the response
        if (action.payload?.updatedCart?.data) {
          state.cartItems = action.payload.updatedCart.data;
        }
      })
      .addCase(updateCartItem.rejected, (state, action: PayloadAction<any>) => {
        state.updatingItem = false;
        state.error = action.payload;
        toast.error(action.payload || "Update failed");
      });

    builder
      .addCase(placeOrder.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.orders.push(action.payload.data);
      })
      .addCase(placeOrder.rejected, (state) => {
        state.placingOrder = false;
      });

    // Place Multiple Cart Orders
    builder
      .addCase(placeMultipleCartOrders.pending, (state) => {
        state.placingOrder = true;
      })
      .addCase(placeMultipleCartOrders.fulfilled, (state, action) => {
        state.placingOrder = false;
        if (action.payload.success && action.payload.results) {
          action.payload.results.forEach((result: any) => {
            if (result.data) {
              state.orders.push(result.data);
            }
          });
        }
      })
      .addCase(placeMultipleCartOrders.rejected, (state) => {
        state.placingOrder = false;
      });

    // Create Payment
    builder.addCase(createPayment.pending, (state) => {
      state.isCreatePaymentLoading = true;
    });
    builder.addCase(createPayment.fulfilled, (state, action) => {
      state.isCreatePaymentLoading = false;
    });
    builder.addCase(createPayment.rejected, (state) => {
      state.isCreatePaymentLoading = false;
    });
    builder
      .addCase(getOrdersByUser.pending, (state) => {
        state.fetchingOrders = true;
      })
      .addCase(getOrdersByUser.fulfilled, (state, action) => {
        state.fetchingOrders = false;
        state.orders = action.payload.data || [];
        state.ordersPagination = action.payload.pagination;
      })
      .addCase(getOrdersByUser.rejected, (state) => {
        state.fetchingOrders = false;
      });
    // Get Order
    builder
      .addCase(getOrderById.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.order = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = (action.payload as any)?.message || "Failed to fetch order";
      });
    // Create Order Payment
    builder.addCase(createPaymentOrder.pending, (state) => {
      state.isOrderPaymentLoading = true;
    });
    builder.addCase(createPaymentOrder.fulfilled, (state) => {
      state.isOrderPaymentLoading = false;
    });
    builder.addCase(createPaymentOrder.rejected, (state) => {
      state.isOrderPaymentLoading = false;
    });
    // Get Proxy Order Details
    builder
      .addCase(getProxyOrderDetails.pending, (state) => {
        state.proxyOrderLoading = true;
        state.error = null;
      })
      .addCase(getProxyOrderDetails.fulfilled, (state, action) => {
        state.proxyOrderLoading = false;
        state.order = action.payload;
      })
      .addCase(getProxyOrderDetails.rejected, (state, action) => {
        state.proxyOrderLoading = false;
        state.error = (action.payload as any)?.message || "Failed to fetch proxy order details";
      });
    // Prolong Proxy Order
    builder
      .addCase(prolongProxyOrder.pending, (state) => {
        state.prolongingOrder = true;
        state.error = null;
      })
      .addCase(prolongProxyOrder.fulfilled, (state, action) => {
        state.prolongingOrder = false;
        // Update the order with new data
        state.order = action.payload;
      })
      .addCase(prolongProxyOrder.rejected, (state, action) => {
        state.prolongingOrder = false;
        state.error = (action.payload as any)?.message || "Failed to prolong proxy order";
      });
    // Check Order Status
    builder
      .addCase(checkOrderStatus.pending, (state) => {
        state.checkingOrderStatus = true;
        state.error = null;
      })
      .addCase(checkOrderStatus.fulfilled, (state, action) => {
        state.checkingOrderStatus = false;
        // Update order with status and proxy details
        if (action.payload.success && action.payload.data) {
          state.order = action.payload.data;
        }
      })
      .addCase(checkOrderStatus.rejected, (state, action) => {
        state.checkingOrderStatus = false;
        state.error = (action.payload as any)?.message || "Failed to check order status";
      });
    // Guest Pay with Wallet
    builder
      .addCase(guestPayWithWallet.pending, (state) => {
        state.isOrderPaymentLoading = true;
        state.error = null;
      })
      .addCase(guestPayWithWallet.fulfilled, (state, action) => {
        state.isOrderPaymentLoading = false;
        if (action.payload.success) {
          toast.success(action.payload.message || "Guest wallet payment completed successfully");
        }
      })
      .addCase(guestPayWithWallet.rejected, (state, action) => {
        state.isOrderPaymentLoading = false;
        state.error = (action.payload as any)?.message || "Failed to pay with wallet";
      });
  },
});

export const { updateCartItemLocally, resetBookingSlice } = bookingSlice.actions;

export default bookingSlice.reducer;
