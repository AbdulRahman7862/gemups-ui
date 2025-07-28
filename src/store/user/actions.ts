import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  AddUserData,
  LoginData,
  SignupData,
  UpdateUserData,
  UpdateUserPassword,
  UserBalanceResponse,
} from "./interface";
import { setAuthToken } from "@/utils/authCookies";
import { 
  createGuestUser, 
  loginGuestUser, 
  convertToRegularUser, 
  initializeGuestUser,
  ConvertToRegularUserData 
} from "@/utils/guestUser";

export const loginUser = createAsyncThunk<any, LoginData, { rejectValue: any }>(
  "user/login",
  async ({ payload, onSuccess }, thunkAPI) => {
    try {
      const response = await axiosInstance.post<any>("/api/auth/login", payload);

      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        onSuccess?.();
        // Map the API response to match the reducer's expected structure
        return {
          success: response.data.success,
          data: {
            user: response.data.user,
            token: response.data.token,
          },
          message: response.data.message || "Login successful",
        };
      } else {
        return thunkAPI.rejectWithValue(response?.data || "Login failed");
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to Login");
    }
  }
);

export const addUser = createAsyncThunk<any, AddUserData, { rejectValue: any }>(
  "user/addUser",
  async ({ payload, onSuccess }, thunkAPI) => {
    try {
      const response = await axiosInstance.post<any>("/api/auth/add-user", payload);

      onSuccess?.();
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to Add User");
    }
  }
);

export const singupUser = createAsyncThunk<any, SignupData, { rejectValue: any }>(
  "user/signup",
  async ({ payload, onSuccess }, thunkAPI) => {
    try {
      const response = await axiosInstance.post<any>("/api/auth/signup", payload);
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        onSuccess?.();
        return {
          success: response.data.success,
          data: {
            user: response.data.user,
            token: response.data.token,
          },
          message: response.data.message || "Signup successful",
        };
      } else {
        return thunkAPI.rejectWithValue(response?.data || "Signup failed");
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to Signup");
    }
  }
);
export const signUpGuestUser = createAsyncThunk<any, SignupData, { rejectValue: any }>(
  "user/signUpGuestUser",
  async ({ payload, onSuccess }, thunkAPI) => {
    try {
      const response = await axiosInstance.post<any>("/auth/signup", payload);
      onSuccess?.();
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update user details"
      );
    }
  }
);

export const getUserDetail = createAsyncThunk(
  "user/getUserDetail",
  async (_, thunkAPI) => {
    try {
      // Make the request with the token in the Authorization header
      const response = await axiosInstance.get("/users/me");

      if (response.data) {
        return response.data;
      } else {
        return thunkAPI.rejectWithValue("Failed to fetch user details");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data || "Failed to fetch user details";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);
export const updateUserProfile = createAsyncThunk<
  any,
  UpdateUserData,
  { rejectValue: any }
>("user/updateUserProfile", async ({ payload, onSuccess }, thunkAPI) => {
  try {
    // Make the request with the token in the Authorization header
    const response = await axiosInstance.put("/users/update-profile", payload);

    if (response.data) {
      onSuccess?.();
      return response.data;
    } else {
      return thunkAPI.rejectWithValue("Failed to update user details");
    }
  } catch (error: any) {
    const errorMessage = error.response?.data || "Failed to update user details";
    toast.error(errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

export const updateUserPassword = createAsyncThunk<
  any,
  UpdateUserPassword,
  { rejectValue: any }
>("user/updateUserPassword", async ({ payload, onSuccess }, thunkAPI) => {
  try {
    // Make the request with the token in the Authorization header
    const response = await axiosInstance.put("/users/update-password", payload);

    if (response.data) {
      onSuccess?.();
      return response.data;
    } else {
      return thunkAPI.rejectWithValue("Failed to update user password");
    }
  } catch (error: any) {
    const errorMessage = error.response?.data || "Failed to update user password";
    toast.error(errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

export const deleteAssetByType = createAsyncThunk(
  "user/deleteAssetByType",
  async (type: "image" | "banner", thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/users/delete/${type}`);

      if (response.data) {
        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`
        );
        return response.data;
      } else {
        return thunkAPI.rejectWithValue(`Failed to delete ${type}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data || `Failed to delete ${type}`;
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const depositToWallet = createAsyncThunk<any, { amount: number }, { rejectValue: any }>(
  "user/depositToWallet",
  async ({ amount }, thunkAPI) => {
    try {
      const response = await axiosInstance.post<any>("/api/wallet/deposit", { amount });
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to initiate deposit");
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to initiate deposit");
    }
  }
);

export const getUserBalance = createAsyncThunk<UserBalanceResponse, void>(
  "user/getUserBalance",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/wallet/balance`);
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch user balance");
      return thunkAPI.rejectWithValue(error.response?.data || "Unknown error");
    }
  }
);

// Initiate wallet deposit
export const initiateWalletDeposit = createAsyncThunk(
  "user/initiateWalletDeposit",
  async ({ amount }: { amount: number }, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/wallet/deposit", { amount });
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Check wallet deposit status - DISABLED: Using webhook instead
// export const checkWalletDepositStatus = createAsyncThunk(
//   "user/checkWalletDepositStatus",
//   async ({ orderId }: { orderId: string }, thunkAPI) => {
//     try {
//       const response = await axiosInstance.get(`/api/wallet/deposit/status/${orderId}`);
//       return response.data;
//     } catch (error: any) {
//       return thunkAPI.rejectWithValue(error.response?.data || { message: error.message });
//     }
//   }
// );

// Guest User Actions
export const createGuestUserAction = createAsyncThunk<any, { onSuccess?: () => void }, { rejectValue: any }>(
  "user/createGuestUser",
  async ({ onSuccess }, thunkAPI) => {
    try {
      const response = await createGuestUser();
      onSuccess?.();
      return {
        success: response.success,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.message || "Guest user created successfully",
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to create guest user");
    }
  }
);

export const loginGuestUserAction = createAsyncThunk<any, { onSuccess?: () => void }, { rejectValue: any }>(
  "user/loginGuestUser",
  async ({ onSuccess }, thunkAPI) => {
    try {
      const response = await loginGuestUser();
      onSuccess?.();
      return {
        success: response.success,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.message || "Guest user logged in successfully",
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to login guest user");
    }
  }
);

export const initializeGuestUserAction = createAsyncThunk<any, { onSuccess?: () => void }, { rejectValue: any }>(
  "user/initializeGuestUser",
  async ({ onSuccess }, thunkAPI) => {
    try {
      const response = await initializeGuestUser();
      onSuccess?.();
      return {
        success: response.success,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.message || "Guest user initialized successfully",
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to initialize guest user");
    }
  }
);

export const convertGuestToRegularUserAction = createAsyncThunk<any, { payload: ConvertToRegularUserData; onSuccess?: () => void }, { rejectValue: any }>(
  "user/convertGuestToRegularUser",
  async ({ payload, onSuccess }, thunkAPI) => {
    try {
      const response = await convertToRegularUser(payload);
      onSuccess?.();
      return {
        success: response.success,
        data: {
          user: response.data.user,
          token: response.data.token,
        },
        message: response.message || "Successfully converted to regular user",
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to convert to regular user");
    }
  }
);

// NOTE: setAuthToken now uses localStorage instead of cookies.
