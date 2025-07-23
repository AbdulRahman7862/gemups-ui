import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

// Get Proxies
export const getProxies = createAsyncThunk<any, void>(
  "proxy/getProxies",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/api/proxies/");
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to fetch proxies");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get Single Proxy
export const getSingleProxy = createAsyncThunk<any, any>(
  "proxy/getProxyById",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/product/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to fetch proxy");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const getOtherSellers = createAsyncThunk<any, any>(
  "proxy/getOtherSellers",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/provider/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to fetch proxies");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get Pricing for Proxy from a Specific Provider
export const getProxyPricing = createAsyncThunk<
  any,
  { proxyId: any; providerId: string }
>("proxy/getProxyPricing", async ({ proxyId, providerId }, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/api/proxies/pricing/${proxyId}/${providerId}`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch pricing");
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});
