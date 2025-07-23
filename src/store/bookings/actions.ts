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
}

// Add to Cart
export const addToCart = createAsyncThunk<any, any>(
  "cart/addToCart",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/cart", data);

      toast.success("Added to cart successfully.");
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

      const response = await axiosInstance.get(`/order?${query}`);
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
      const response = await axiosInstance.get(`/order/${orderId}`);
      return response.data.data;
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

      const response = await axiosInstance.post(`/order/create-payment`, payload);

      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create payment");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);
