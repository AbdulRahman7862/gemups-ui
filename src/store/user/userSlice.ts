import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  addUser,
  deleteAssetByType,
  getUserBalance,
  getUserDetail,
  loginUser,
  signUpGuestUser,
  singupUser,
  updateUserPassword,
  updateUserProfile,
  createGuestUserAction,
  loginGuestUserAction,
  initializeGuestUserAction,
  convertGuestToRegularUserAction,
} from "./actions";
import { UserState } from "./interface";
import { setAuthToken, clearUserUID, clearAllAuthCookies } from "@/utils/authCookies";

const initialState: UserState = {
  user: null,
  walletBalance: null,
  isLoading: false,
  isAddUserLoading: false,
  isProfileUpdating: false,
  isFetchingUser: false,
  isFetchingBalance: false,
  deletingImage: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state) => {
      clearAllAuthCookies();
      state.user = null;
    },
    removeExistingUser: (state) => {
      state.user = null;
    },
    resetUserSlice: () => {
      clearAllAuthCookies();
      return initialState;
    },
    updateWalletBalance: (state, action: PayloadAction<number>) => {
      state.walletBalance = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
          clearUserUID();
          toast.success(action?.payload?.message || "Login successful");
        } else {
          toast.error(action?.payload?.message || "Login failed");
        }
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action?.payload?.message || "Login failed");
        state.isLoading = false;
      })

      // Add User
      .addCase(addUser.pending, (state) => {
        state.isAddUserLoading = true;
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
        } else {
          toast.error(action?.payload?.message || "Failed to add user");
        }
        state.isAddUserLoading = false;
      })
      .addCase(addUser.rejected, (state, action: PayloadAction<any>) => {
        toast.error(
          action?.payload?.response?.data?.message ||
            action?.payload?.message ||
            "Something went wrong"
        );
        state.isAddUserLoading = false;
      })

      // Signup
      .addCase(singupUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(singupUser.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
          clearUserUID();
          toast.success(action?.payload?.message || "Signup successful");
        } else {
          toast.error(action?.payload?.message || "Signup failed");
        }
        state.isLoading = false;
      })
      .addCase(singupUser.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action.payload?.message || "Signup failed");
        state.isLoading = false;
      })
      // Signup Guest
      .addCase(signUpGuestUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signUpGuestUser.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.existing;
          setAuthToken(action.payload.data.token);
          clearUserUID();
          toast.success(action?.payload?.message || "Profile updated successfully");
        } else {
          toast.error(action?.payload?.message || "Profile update failed");
        }
        state.isLoading = false;
      })
      .addCase(signUpGuestUser.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action.payload?.message || "Profile update failed");
        state.isLoading = false;
      })

      // Get User Detail
      .addCase(getUserDetail.pending, (state) => {
        state.isFetchingUser = true;
      })
      .addCase(getUserDetail.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data;
        } else {
          toast.error(action?.payload?.message || "Failed to load user details");
        }
        state.isFetchingUser = false;
      })
      .addCase(getUserDetail.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action.payload?.message || "Failed to fetch user details");
        state.isFetchingUser = false;
        state.user = null;
        clearAllAuthCookies();
      })

      // Updae Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
        } else {
          toast.error(action?.payload?.message || "Profile update failed");
        }
        state.isLoading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action.payload?.message || "Profile update failed");
        state.isLoading = false;
      })

      // Updae Password
      .addCase(updateUserPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserPassword.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          toast.success(action?.payload?.message || "Profile updated successfully");
        } else {
          toast.error(action?.payload?.message || "Profile update failed");
        }
        state.isLoading = false;
      })
      .addCase(updateUserPassword.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action.payload?.message || "Profile update failed");
        state.isLoading = false;
      })
      .addCase(deleteAssetByType.pending, (state) => {
        state.deletingImage = true;
      })
      .addCase(deleteAssetByType.fulfilled, (state) => {
        state.deletingImage = false;
      })
      .addCase(deleteAssetByType.rejected, (state) => {
        state.deletingImage = false;
      })

      // Guest User Actions
      .addCase(createGuestUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGuestUserAction.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
          toast.success(action?.payload?.message || "Guest user created successfully");
        } else {
          toast.error(action?.payload?.message || "Failed to create guest user");
        }
        state.isLoading = false;
      })
      .addCase(createGuestUserAction.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action?.payload?.message || "Failed to create guest user");
        state.isLoading = false;
      })

      .addCase(loginGuestUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginGuestUserAction.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
          toast.success(action?.payload?.message || "Guest user logged in successfully");
        } else {
          toast.error(action?.payload?.message || "Failed to login guest user");
        }
        state.isLoading = false;
      })
      .addCase(loginGuestUserAction.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action?.payload?.message || "Failed to login guest user");
        state.isLoading = false;
      })

      .addCase(initializeGuestUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeGuestUserAction.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
          toast.success(action?.payload?.message || "Guest user initialized successfully");
        } else {
          toast.error(action?.payload?.message || "Failed to initialize guest user");
        }
        state.isLoading = false;
      })
      .addCase(initializeGuestUserAction.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action?.payload?.message || "Failed to initialize guest user");
        state.isLoading = false;
      })

      .addCase(convertGuestToRegularUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(convertGuestToRegularUserAction.fulfilled, (state, action: PayloadAction<any>) => {
        if (action.payload.success) {
          state.user = action.payload.data.user;
          setAuthToken(action.payload.data.token);
          toast.success(action?.payload?.message || "Successfully converted to regular user");
        } else {
          toast.error(action?.payload?.message || "Failed to convert to regular user");
        }
        state.isLoading = false;
      })
      .addCase(convertGuestToRegularUserAction.rejected, (state, action: PayloadAction<any>) => {
        toast.error(action?.payload?.message || "Failed to convert to regular user");
        state.isLoading = false;
      });

    // Get User Balance
    builder.addCase(getUserBalance.pending, (state) => {
      state.isFetchingBalance = true;
    });
    builder.addCase(getUserBalance.fulfilled, (state, action: PayloadAction<any>) => {
      if (action.payload.success) {
        state.walletBalance = action.payload?.balance || 0;
      } else {
        toast.error(action?.payload?.message || "Failed to fetch user balance");
      }
      state.isFetchingBalance = false;
    });
    builder.addCase(getUserBalance.rejected, (state, action: PayloadAction<any>) => {
      state.isFetchingBalance = false;
      toast.error(action.payload?.message || "Failed to fetch user balance");
    });
  },
});

export const { logoutUser, removeExistingUser, resetUserSlice, updateWalletBalance } = userSlice.actions;

// Optional global slice reset
export const resetAllSlices = () => {
  return { type: "RESET_ALL_SLICES" };
};

export default userSlice.reducer;
