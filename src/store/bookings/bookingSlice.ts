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
  updateCartItem,
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
      .addCase(addToCart.fulfilled, (state) => {
        state.addingtoCart = false;
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
        state.cartItems = state.cartItems.filter((item) => item._id !== deletedId);
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
      .addCase(updateCartItem.fulfilled, (state) => {
        state.updatingItem = false;
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
  },
});

export const { updateCartItemLocally, resetBookingSlice } = bookingSlice.actions;

export default bookingSlice.reducer;
