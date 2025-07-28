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
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch proxies";
      console.error(message);
      return thunkAPI.rejectWithValue(error?.response?.data || { message });
    }
  }
);

// Get Single Proxy
export const getSingleProxy = createAsyncThunk<any, any>(
  "proxy/getProxyById",
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/proxies/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(error.response?.data?.message || "Failed to fetch proxy");
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

// Get Other Sellers (products for a provider)
export const getOtherSellers = createAsyncThunk<any, any>(
  "proxy/getOtherSellers",
  async (id, thunkAPI) => {
    try {
      // This endpoint returns all products for the given provider ID, as an array
      const response = await axiosInstance.get(`/provider/${id}`);
      return response.data; // response.data.data is an array of products for the provider
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
    // console.log("Provider ID", providerId, "Proxy ID", proxyId );
    const response = await axiosInstance.get(`/api/proxies/pricing/${proxyId}/${providerId}`);
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to fetch pricing");
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});
