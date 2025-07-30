import { getOrCreateDeviceIdClient } from "./deviceId";
import { axiosInstance } from "./axiosInstance";
import { setAuthToken, getAuthToken } from "./authCookies";

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
    console.log("DEBUG: Creating new guest user with device UID:", deviceUid);
    
    const response = await axiosInstance.post<GuestUserResponse>("/auth/add-user", {
      uid: deviceUid
    });

    console.log("DEBUG: Create guest user response:", response.data);

    if (response.data.success) {
      // Store token using existing auth utility
      setAuthToken(response.data.data.token);
      console.log("DEBUG: Successfully created guest user");
    }

    return response.data;
  } catch (error: any) {
    console.error("DEBUG: Create guest user error:", error.response?.data || error.message);
    console.error("DEBUG: Error response status:", error.response?.status);
    console.error("DEBUG: Error response data:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to create guest user");
  }
};

/**
 * Login existing guest user
 */
export const loginGuestUser = async (): Promise<GuestUserResponse> => {
  try {
    const deviceUid = getDeviceUid();
    console.log("DEBUG: Attempting to login guest user with device UID:", deviceUid);
    
    // Use the add-user endpoint which handles both login and creation
    // It checks if user exists and returns existing user or creates new one
    const response = await axiosInstance.post<GuestUserResponse>("/auth/add-user", {
      uid: deviceUid
    });

    console.log("DEBUG: Login response:", response.data);
    console.log("DEBUG: User ID from response:", response.data.data?.user?._id);
    console.log("DEBUG: User UID from response:", response.data.data?.user?.uid);
    console.log("DEBUG: Is this a new user?", response.data.data?.user?.createdAt);

    if (response.data.success) {
      // Store token using existing auth utility
      setAuthToken(response.data.data.token);
      console.log("DEBUG: Successfully logged in guest user");
    }

    return response.data;
  } catch (error: any) {
    console.error("DEBUG: Login guest user error:", error.response?.data || error.message);
    console.error("DEBUG: Error response status:", error.response?.status);
    console.error("DEBUG: Error response data:", error.response?.data);
    console.error("DEBUG: Request URL:", error.config?.url);
    console.error("DEBUG: Request data:", error.config?.data);
    
    // If user not found (404), this is expected - user doesn't exist yet
    if (error.response?.status === 404) {
      console.log("DEBUG: User not found (404) - this is expected for new devices");
      throw new Error("User not found");
    }
    
    // If it's a 400 error with "Email and password are required", 
    // it means we're hitting the wrong endpoint
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes("Email and password are required")) {
      console.error("DEBUG: Hitting wrong login endpoint - this should be guest user login");
      throw new Error("Wrong login endpoint - guest user login failed");
    }
    
    throw new Error(error.response?.data?.message || "Failed to login guest user");
  }
};

/**
 * Convert guest user to regular user
 */
export const convertToRegularUser = async (userData: ConvertToRegularUserData): Promise<GuestUserResponse> => {
  try {
    console.log("DEBUG: Converting guest user to regular user");
    console.log("DEBUG: Request data:", userData);
    console.log("DEBUG: Request URL:", "/auth/signup");
    
    const response = await axiosInstance.post<GuestUserResponse>("/auth/signup", userData);

    console.log("DEBUG: Conversion response:", response.data);

    if (response.data.success) {
      // Update stored token
      setAuthToken(response.data.data.token);
    }

    return response.data;
  } catch (error: any) {
    console.error("DEBUG: Conversion error:", error.response?.data);
    console.error("DEBUG: Error status:", error.response?.status);
    throw new Error(error.response?.data?.message || "Failed to convert to regular user");
  }
};

/**
 * Initialize guest user on app start
 * This function handles both creating new guest users and logging in existing ones
 */
export const initializeGuestUser = async (): Promise<GuestUserResponse> => {
  try {
    console.log("DEBUG: Starting guest user initialization");
    
    // Check if there's already a token for this device
    const existingToken = getAuthToken();
    const deviceUid = getDeviceUid();
    
    console.log("DEBUG: Device UID:", deviceUid);
    console.log("DEBUG: Existing token:", existingToken ? "Found" : "Not found");
    
    // If there's already a token, try to use it first
    if (existingToken) {
      console.log("DEBUG: Found existing token, attempting to validate");
      try {
        // Try to validate the existing token by making a request
        const response = await axiosInstance.get("/auth/me");
        console.log("DEBUG: Existing token is valid, reusing session");
        console.log("DEBUG: User data from token validation:", response.data);
        if (response.data) {
          // Token is still valid, return the existing user data
          return {
            success: true,
            data: {
              user: response.data.data.user,
              token: existingToken
            },
            message: "Existing guest user session restored"
          };
        }
      } catch (tokenError: any) {
        console.log("DEBUG: Token validation failed:", tokenError.response?.status, tokenError.response?.data);
        // Token is invalid, clear it and continue with login/creation flow
        console.log("DEBUG: Existing token is invalid, clearing and proceeding with login/creation");
        localStorage.removeItem("token");
      }
    }
    
    // Since we're using the same endpoint for both login and creation,
    // we can just call loginGuestUser which will handle both cases
    console.log("DEBUG: Attempting to login/create guest user with device UID:", deviceUid);
    const response = await loginGuestUser();
    console.log("DEBUG: Successfully initialized guest user");
    console.log("DEBUG: Response data:", response);
    return response;
  } catch (error: any) {
    console.error("DEBUG: Guest user initialization failed:", error);
    throw error;
  }
}; 