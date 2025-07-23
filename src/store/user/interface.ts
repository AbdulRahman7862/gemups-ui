export interface UserState {
  user: any | null;
  walletBalance: number | null;
  isLoading: boolean;
  isAddUserLoading: boolean;
  isProfileUpdating: boolean;
  isFetchingUser: boolean;
  isFetchingBalance: boolean;
  deletingImage: boolean;
}

export interface LoginData {
  payload: {
    email: string;
    password: string;
  };
  onSuccess: () => void;
}
export interface AddUserData {
  payload: {
    uid: any;
  };
  onSuccess: () => void;
}
export interface SignupData {
  payload: {
    email: string;
    password: string;
  };
  onSuccess: () => void;
}
export interface UpdateUserData {
  payload: FormData;
  onSuccess: () => void;
}
export interface UpdateUserPassword {
  payload: {
    currentPassword: string;
    newPassword: string;
  };
  onSuccess: () => void;
}

export interface UserBalanceResponse {
  balance: number;
}
