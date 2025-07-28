import { createSlice } from "@reduxjs/toolkit";
import { getOtherSellers, getProxies, getProxyPricing, getSingleProxy } from "./actions";

interface ProxyState {
  proxies: any[];
  otherSellers: any[];
  pricingPlans: any[];
  fetchingProxies: boolean;
  fetchingOtherSellers: boolean;
  fetchPricingPlans: boolean;
  selectedProxy: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProxyState = {
  proxies: [],
  otherSellers: [],
  fetchingOtherSellers: false,
  fetchPricingPlans: false,
  pricingPlans: [],
  fetchingProxies: false,
  selectedProxy: null,
  isLoading: false,
  error: null,
};

const proxySlice = createSlice({
  name: "proxy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProxies.pending, (state) => {
        state.fetchingProxies = true;
        state.error = null;
      })
      .addCase(getProxies.fulfilled, (state, action) => {
        state.proxies = action.payload.data;
        state.fetchingProxies = false;
      })
      .addCase(getProxies.rejected, (state, action) => {
        state.fetchingProxies = false;
        state.error = action.payload as string;
      });
    // Get single proxy by ID
    builder
      .addCase(getSingleProxy.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.selectedProxy = null;
      })
      .addCase(getSingleProxy.fulfilled, (state, action) => {
        state.selectedProxy = Array.isArray(action.payload.data)
          ? action.payload.data[0]
          : action.payload.data;
        state.isLoading = false;
      })
      .addCase(getSingleProxy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(getOtherSellers.pending, (state) => {
        state.fetchingOtherSellers = true;
        state.error = null;
      })
      .addCase(getOtherSellers.fulfilled, (state, action) => {
        state.otherSellers = action.payload.data;
        state.fetchingOtherSellers = false;
      })
      .addCase(getOtherSellers.rejected, (state, action) => {
        state.fetchingOtherSellers = false;
        state.error = action.payload as string;
      });
    builder
      .addCase(getProxyPricing.pending, (state) => {
        state.fetchPricingPlans = true;
        state.error = null;
      })
      .addCase(getProxyPricing.fulfilled, (state, action) => {
        state.pricingPlans = action.payload.data;
        state.fetchPricingPlans = false;
      })
      .addCase(getProxyPricing.rejected, (state, action) => {
        state.fetchPricingPlans = false;
        state.error = action.payload as string;
      });
  },
});

export default proxySlice.reducer;
