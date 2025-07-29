"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser, getUserDetail } from "@/store/user/actions";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";

// NOTE: getAuthToken and getUserUID now use localStorage instead of cookies.
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user.user);

  // Define public routes that don't require authentication
  const publicRoutes = ["/signin", "/signup"];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

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
        } else if (!isPublicRoute) {
          // No token and no UID - redirect to login only for non-public routes
          router.replace("/signin");
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
        // Only redirect to login on error if not on a public route
        if (!isPublicRoute) {
          router.replace("/signin");
        }
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
  }, [dispatch, router, pathname, isPublicRoute]);

  return <>{children}</>;
};

export default AuthInitializer;
