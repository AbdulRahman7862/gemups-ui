"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  createGuestUserAction, 
  loginGuestUserAction, 
  initializeGuestUserAction,
  convertGuestToRegularUserAction 
} from "@/store/user/actions";
import { ConvertToRegularUserData } from "@/utils/guestUser";
import { getAuthToken } from "@/utils/authCookies";

export const useGuestUser = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);

  const isGuestUser = user?.isGuest === true;

  const createGuestUser = async (onSuccess?: () => void) => {
    try {
      await dispatch(createGuestUserAction({ onSuccess }));
    } catch (error) {
      console.error("Failed to create guest user:", error);
      throw error;
    }
  };

  const loginGuestUser = async (onSuccess?: () => void) => {
    try {
      await dispatch(loginGuestUserAction({ onSuccess }));
    } catch (error) {
      console.error("Failed to login guest user:", error);
      throw error;
    }
  };

  const initializeGuestUser = async (onSuccess?: () => void) => {
    try {
      await dispatch(initializeGuestUserAction({ onSuccess }));
    } catch (error) {
      console.error("Failed to initialize guest user:", error);
      throw error;
    }
  };

  const convertToRegularUser = async (userData: ConvertToRegularUserData, onSuccess?: () => void) => {
    try {
      await dispatch(convertGuestToRegularUserAction({ payload: userData, onSuccess }));
    } catch (error) {
      console.error("Failed to convert guest user:", error);
      throw error;
    }
  };

  // New function to handle guest user initialization when adding to cart
  const initializeGuestUserForCart = async (onSuccess?: () => void) => {
    try {
      const token = getAuthToken();
      
      // If no token exists, initialize guest user
      if (!token) {
        await dispatch(initializeGuestUserAction({ onSuccess, showToast: false }));
        return true;
      }
      
      // If token exists but no user is loaded, try to initialize guest user
      if (token && !user && !isLoading) {
        await dispatch(initializeGuestUserAction({ onSuccess, showToast: false }));
        return true;
      }
      
      return false; // No initialization needed
    } catch (error) {
      console.error("Failed to initialize guest user for cart:", error);
      throw error;
    }
  };

  return {
    isGuestUser,
    isLoading,
    user,
    createGuestUser,
    loginGuestUser,
    initializeGuestUser,
    convertToRegularUser,
    initializeGuestUserForCart,
  };
}; 