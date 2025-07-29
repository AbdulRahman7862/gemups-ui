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
  // Don't clear the device UID - keep it for guest user continuity
  // clearUserUID(); // ← Removed this line
  // Set a flag to indicate user has explicitly logged out
  localStorage.setItem("userLoggedOut", "true");
};

export const setUserLoggedOut = () => {
  localStorage.setItem("userLoggedOut", "true");
};

export const clearUserLoggedOutFlag = () => {
  localStorage.removeItem("userLoggedOut");
};

export const hasUserLoggedOut = (): boolean => {
  return localStorage.getItem("userLoggedOut") === "true";
};

