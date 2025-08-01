"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { singupUser, initializeGuestUserAction } from "@/store/user/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { getOrCreateDeviceIdClient } from "@/utils/deviceId";
import { encryptData } from "@/utils/crypto";
import { clearUserLoggedOutFlag } from "@/utils/authCookies";

export default function SignUpForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading } = useAppSelector((state) => state.user);
  // const [isChecked, setIsChecked] = useState(false);

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
  });

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (values: any) => {
    try {
      // Send the form data to the backend
      dispatch(
        singupUser({
          payload: {
            email: values.email,
            password: values.password,
          },
          onSuccess: () => {
            router.push("/proxy");
          },
        })
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      // Clear the logout flag when user explicitly chooses to continue as guest
      clearUserLoggedOutFlag();
      
      await dispatch(
        initializeGuestUserAction({
          onSuccess: () => {
            router.push("/proxy");
          },
        })
      );
    } catch (error) {
      console.error("Failed to initialize guest user:", error);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar py-10">
      {/* <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div> */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to sign up!
            </p>
          </div>
          <div>
            {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                Sign up with Google
              </button>
              <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                <svg
                  width="21"
                  className="fill-current"
                  height="20"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                </svg>
                Sign up with X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-[#030507] sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div> */}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue, handleSubmit, handleChange, handleBlur }) => {
                return (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {/* <!-- Email --> */}
                      <div>
                        <Label>
                          Email<span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          placeholder="Enter your email"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                      {/* <!-- Password --> */}
                      <div>
                        <Label>
                          Password<span className="text-error-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            name="password"
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                          />
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                          >
                            {showPassword ? (
                              <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                            ) : (
                              <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                            )}
                          </span>
                        </div>
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>
                      {/* <!-- Checkbox --> */}
                      {/* <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div> */}
                      {/* <!-- Button --> */}
                      <div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition rounded-lg bg-[#13F195] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <BeatLoader color="#030507" size={10} />
                          ) : (
                            "Sign Up"
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                );
              }}
            </Formik>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  <button
                    onClick={handleGuestLogin}
                    className="text-[#13F195] underline hover:text-[#10D286] transition-colors font-semibold"
                  >
                    Continue as a Guest
                  </button>
                </p>
              </div>

              <div className="relative flex items-center justify-center sm:justify-start">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="mx-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                  OR
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-[#13F195] hover:text-[#10D286] transition-colors font-semibold"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
