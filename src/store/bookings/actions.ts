import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { getAuthToken } from "@/utils/authCookies";

interface CreatePaymentPayload {
  amount: string;
  currency: string;
}

interface PaymentPayload {
  currency: string;
  productId: any;
  isOrder: boolean;
  quantity: number;
  type: string;
  providerId: any;
  createSingleOrder?: boolean;
  orderCount?: number;
  amount?: number;
  expire?: string;
  flow?: string;
  host?: string;
  isProlong?: boolean;
  existingOrderId?: string;
  selectedTier?: {
    userDataAmount: number;
    unit: string;
    price: number;
    isPopular?: boolean;
    quantity: number;
  } | null;
}

// Add to Cart
export const addToCart = createAsyncThunk<any, any>(
  "cart/addToCart",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/cart", data);

      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add to cart");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get All Cart Items By User
export const getCartByUser = createAsyncThunk<any, void>(
  "cart/getCartByUser",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/cart`);
      console.log('DEBUG getCartByUser API response:', response.data);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to get user cart");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Delete Cart Item
export const deleteCartItem = createAsyncThunk<any, string>(
  "cart/deleteCartItem",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/cart/${id}`);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to remove cart item");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Update Cart Item
export const updateCartItem = createAsyncThunk<any, { id: string; data: any }>(
  "cart/updateCartItem",
  async ({ id, data }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/cart/${id}`, data);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update cart item");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Place Order - POST /order
export const placeOrder = createAsyncThunk<any, any>(
  "order/placeOrder",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/order", data);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to place order");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get Orders by User ID
export const getOrdersByUser = createAsyncThunk<any, any>(
  "order/getOrdersByUser",
  async (data, thunkAPI) => {
    try {
      const { type, page, limit } = data || {};
      const query = new URLSearchParams({
        ...(type && { type }),
        ...(page && { page: String(page) }),
        ...(limit && { limit: String(limit) }),
      }).toString();

      const response = await axiosInstance.get(`/api/order?${query}`);
      console.log('Orders API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to fetch orders");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const createPayment = createAsyncThunk<any, CreatePaymentPayload>(
  "payment/createPayment",
  async (data, thunkAPI) => {
    try {
      const payload = {
        ...data,
        paymentReference: uuidv4(),
      };

      const response = await axiosInstance.post("/order/create-payment", payload);

      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create payment");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get Single Order by ID
export const getOrderById = createAsyncThunk<any, string>(
  "order/getOrderById",
  async (orderId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/proxy/order/${orderId}`);
      console.log('DEBUG getOrderById API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to fetch order");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const createPaymentOrder = createAsyncThunk<any, PaymentPayload>(
  "payment/createOrderPayment",
  async (data, thunkAPI) => {
    try {
      const payload = {
        ...data,
      };

      console.log('=== CRYPTOMUS PAYMENT REQUEST ===');
      console.log('Endpoint:', '/order/create-payment');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      console.log('Payload Types:', {
        productId: typeof payload.productId,
        currency: typeof payload.currency,
        isOrder: typeof payload.isOrder,
        quantity: typeof payload.quantity,
        type: typeof payload.type,
        providerId: typeof payload.providerId,
        createSingleOrder: typeof payload.createSingleOrder,
        orderCount: typeof payload.orderCount
      });
      console.log('=== END REQUEST ===');

      const response = await axiosInstance.post(`/order/create-payment`, payload);

      console.log('DEBUG: createPaymentOrder success response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== CRYPTOMUS PAYMENT ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Error Message:', error.response?.data?.message);
      console.error('Error Details:', error.response?.data?.error);
      console.error('Error Stack:', error.response?.data?.stack);
      console.error('Full Error Response:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Data:', error.config?.data);
      console.error('Request Headers:', error.config?.headers);
      console.error('=== END ERROR ===');
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.data?.details ||
                          "Failed to create payment";
      
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Pay with Wallet
export const payWithWallet = createAsyncThunk<any, void>(
  "order/payWithWallet",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/order/pay-with-wallet", { payWithWallet: true });
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to pay with wallet");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Guest Pay with Wallet
export const guestPayWithWallet = createAsyncThunk<any, {
  productId: string;
  quantity: number;
  providerId: string;
  type: string;
  cart: Array<{
    productId: string;
    quantity: number;
    providerId: string;
    price: number;
    type: string;
    userDataAmount: number;
    unit: string;
    tierId: string;
    isPopular: boolean;
    shop: string;
    un_flow: number;
    un_flow_used: number;
    expire: number;
  }>;
}>(
  "order/guestPayWithWallet",
  async (data, thunkAPI) => {
    try {
      console.log('DEBUG: Guest wallet payment request:', data);
      const response = await axiosInstance.post("/order/pay-with-wallet", data);
      console.log('DEBUG: Guest wallet payment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('DEBUG: Guest wallet payment error:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to pay with wallet";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Create Proxy Order
export const createProxyOrder = createAsyncThunk<any, {
  expire: string;
  flow: string;
  host: string;
  productId: string;
  providerId: string;
  amount: number;
  isProlong?: boolean;
  existingOrderId?: string;
}>(
  "order/createProxyOrder",
  async (data, thunkAPI) => {
    try {
      console.log('Creating proxy order with data:', data);
      
      const response = await axiosInstance.post("/api/proxy/order/create-order", data);

      const successMessage = data.isProlong ? "Proxy order prolonged successfully" : "Proxy order created successfully";
      toast.success(successMessage);
      console.log("DEBUG createProxyOrder API response:", response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to create proxy order";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get Proxy Order Details
export const getProxyOrderDetails = createAsyncThunk<any, string>(
  "order/getProxyOrderDetails",
  async (orderNo, thunkAPI) => {
    try {    
      // Try different possible endpoints and formats
      let response;
      
      // First try the standard proxy order endpoint
      try {
        response = await axiosInstance.get(`/api/proxy/order/${orderNo}`);
        return response.data;
      } catch (firstError: any) {
        console.log(`DEBUG: First attempt failed for ${orderNo}:`, firstError.response?.status);
        
        // If it's a 400 error, try alternative approaches
        if (firstError.response?.status === 400) {
          // Try without the /api prefix
          try {
            response = await axiosInstance.get(`/proxy/order/${orderNo}`);
            return response.data;
          } catch (secondError: any) {
            console.log(`DEBUG: Second attempt failed for ${orderNo}:`, secondError.response?.status);
            
            // Try using the order endpoint instead
            try {
              response = await axiosInstance.get(`/api/order/${orderNo}`);
      return response.data;
            } catch (thirdError: any) {
              console.log(`DEBUG: Third attempt failed for ${orderNo}:`, thirdError.response?.status);
              
              // If all attempts fail, throw the original error
              throw firstError;
            }
          }
        } else {
          // For non-400 errors, throw the original error
          throw firstError;
        }
      }
    } catch (error: any) {
      console.log('DEBUG Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.response?.data?.message,
        orderNo: orderNo
      });
      
      // Log the full error response for debugging
      console.log('DEBUG Full error response:', error.response);
      console.log('DEBUG Error response data:', error.response?.data);
      
      // Don't show toast for 400 errors as they might be expected for some orders
      if (error.response?.status !== 400) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to fetch proxy order details";
      toast.error(errorMessage);
      }
      
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);



// Check Order Status
export const checkOrderStatus = createAsyncThunk<any, string>(
  "order/checkOrderStatus",
  async (orderId, thunkAPI) => {
    try {
      // Try the endpoint without /api first (as per backend guide)
      const response = await axiosInstance.get(`/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      // Silent error handling - no console logs, no toasts
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Prolong Proxy Order
export const prolongProxyOrder = createAsyncThunk<any, {
  expire: string;
  flow: string;
  username: string;
}>(
  "order/prolongProxyOrder",
  async (data, thunkAPI) => {
    try {
      console.log('DEBUG: Prolong proxy order request:', data);
      const response = await axiosInstance.post("/api/proxy/order/prolong", data);
      console.log('DEBUG: Prolong proxy order response:', response.data);
      toast.success("Proxy order prolonged successfully!");
      return response.data;
    } catch (error: any) {
      console.error('DEBUG: Prolong proxy order error:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to prolong proxy order";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

