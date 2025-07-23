"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser, getUserDetail } from "@/store/user/actions";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";

// NOTE: getAuthToken and getUserUID now use localStorage instead of cookies.
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      const uid = getUserUID();
      try {
        if (token) {
          // TODO: Implement user profile fetch when endpoint is available
          // const result = await dispatch(getUserDetail());
          // if (getUserDetail.rejected.match(result)) {
          //   // Token is invalid or expired, clear token and redirect to login
          //   localStorage.removeItem("token");
          //   router.replace("/signin");
          //   return;
          // }
        } else if (uid) {
          // No token but has UID - proceed as guest
          await handleAddUserFlow(uid);
        } else {
          // If neither token nor UID exists, redirect to login
          router.replace("/signin");
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
        // On error, redirect to login
        router.replace("/signin");
      }
    };

    const handleAddUserFlow = async (uid: string) => {
      try {
        const payload = { uid };
        await dispatch(
          addUser({
            payload,
            onSuccess: () => {
              setUserUID(uid);
            },
          })
        );
      } catch (error) {
        console.error("Failed to dispatch addUser:", error);
      }
    };

    initializeAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user_uid") {
        initializeAuth();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, router]);

  return <>{children}</>;
};

export default AuthInitializer;
