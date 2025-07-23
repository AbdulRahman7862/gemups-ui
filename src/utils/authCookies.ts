// Cookie logic replaced with localStorage

export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const getAuthToken = (): string | undefined => {
  return localStorage.getItem("token") || undefined;
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

export const setUserUID = (uid: string) => {
  localStorage.setItem("user_uid", uid);
};

export const getUserUID = (): string | undefined => {
  return localStorage.getItem("user_uid") || undefined;
};

export const clearUserUID = () => {
  localStorage.removeItem("user_uid");
};

export const clearAllAuthCookies = () => {
  clearAuthToken();
  clearUserUID();
};

