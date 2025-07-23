// utils/deviceId.ts
import { v4 as uuidv4 } from "uuid";

const STORAGE_KEY = "user_uid";

export const getOrCreateDeviceIdClient = (): string => {
  if (typeof window === "undefined") {
    throw new Error("This function can only be used in client-side code");
  }

  const existingDeviceId = localStorage.getItem(STORAGE_KEY);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const newDeviceId = uuidv4();
  localStorage.setItem(STORAGE_KEY, newDeviceId);
  return newDeviceId;
};
