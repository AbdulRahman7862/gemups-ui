import { getOrCreateDeviceIdClient } from "./deviceId";
import { axiosInstance } from "./axiosInstance";
import { setAuthToken } from "./authCookies";

export interface GuestUserResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      uid: string;
      isGuest: boolean;
      walletBalance: number;
      email?: string;
      name?: string;
      userName?: string;
      createdAt: string;
    };
    token: string;
  };
  message?: string;
}

export interface ConvertToRegularUserData {
  email: string;
  password: string;
}

/**
 * Generate or retrieve device UID for guest user
 * Uses existing deviceId utility pattern
 */
export const getDeviceUid = (): string => {
  return getOrCreateDeviceIdClient();
};

/**
 * Create a new guest user
 */
export const createGuestUser = async (): Promise<GuestUserResponse> => {
  try {
    const deviceUid = getDeviceUid();
    
    const response = await axiosInstance.post<GuestUserResponse>("/api/auth/add-user", {
      uid: deviceUid
    });

    if (response.data.success) {
      // Store token using existing auth utility
      setAuthToken(response.data.data.token);
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create guest user");
  }
};

/**
 * Login existing guest user
 */
export const loginGuestUser = async (): Promise<GuestUserResponse> => {
  try {
    const deviceUid = getDeviceUid();
    
    const response = await axiosInstance.post<GuestUserResponse>("/api/auth/login", {
      uid: deviceUid
    });

    if (response.data.success) {
      // Store token using existing auth utility
      setAuthToken(response.data.data.token);
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to login guest user");
  }
};

/**
 * Convert guest user to regular user
 */
export const convertToRegularUser = async (userData: ConvertToRegularUserData): Promise<GuestUserResponse> => {
  try {
    const response = await axiosInstance.post<GuestUserResponse>("/auth/signup", userData);

    if (response.data.success) {
      // Update stored token
      setAuthToken(response.data.data.token);
    }

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to convert to regular user");
  }
};

/**
 * Initialize guest user on app start
 * This function handles both creating new guest users and logging in existing ones
 */
export const initializeGuestUser = async (): Promise<GuestUserResponse> => {
  try {
    // First try to login existing guest user
    try {
      return await loginGuestUser();
    } catch (loginError) {
      // If login fails, create new guest user
      return await createGuestUser();
    }
  } catch (error: any) {
    throw new Error(`Guest user initialization failed: ${error.message}`);
  }
}; 