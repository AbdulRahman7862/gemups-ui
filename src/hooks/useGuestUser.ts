"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  createGuestUserAction, 
  loginGuestUserAction, 
  initializeGuestUserAction,
  convertGuestToRegularUserAction 
} from "@/store/user/actions";
import { ConvertToRegularUserData } from "@/utils/guestUser";

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

  return {
    isGuestUser,
    isLoading,
    user,
    createGuestUser,
    loginGuestUser,
    initializeGuestUser,
    convertToRegularUser,
  };
}; 