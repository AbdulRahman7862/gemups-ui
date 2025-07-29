"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { loginUser, initializeGuestUserAction } from "@/store/user/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { clearUserLoggedOutFlag } from "@/utils/authCookies";

export default function SignInForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading } = useAppSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formError, setFormError] = useState("");

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .required("Email is required")
      .email("Must be a valid email"),
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
    setFormError("");
    try {
      // Clear the logout flag when user explicitly logs in
      clearUserLoggedOutFlag();
      
      // Prepare payload
      const payload = {
        email: values.email,
        password: values.password, 
      };

      // Send the form data to the backend
      const resultAction = await dispatch(
        loginUser({
          payload,
          onSuccess: () => {
            router.push("/proxy");
          },
        })
      );
      // If rejected, show error
      if (loginUser.rejected.match(resultAction)) {
        setFormError(resultAction.payload?.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      setFormError(error?.message || "Login failed. Please try again.");
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
    <div className="flex flex-col flex-1 lg:w-1/2 w-full py-10">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in!
            </p>
          </div>
          <div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, handleSubmit, handleChange, handleBlur }) => {
                return (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {formError && (
                        <div className="text-red-500 text-sm text-center font-medium mb-2">{formError}</div>
                      )}
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
                          Password <span className="text-error-500">*</span>
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isChecked} onChange={setIsChecked} />
                          <span className="block font-normal text-gray-700 text-theme-xs sm:text-theme-sm dark:text-gray-400">
                            Keep me logged in
                          </span>
                        </div>
                        <Link href="#" className="text-xs sm:text-sm text-[#13F195]">
                          Forgot password?
                        </Link>
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium transition rounded-lg bg-[#13F195] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <BeatLoader color="#030507" size={10} />
                          ) : (
                            "Sign in"
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
                  Don&apos;t have an account? {""}
                  <Link
                    href="/signup"
                    className="text-[#13F195] hover:text-[#10D286] transition-colors font-semibold"
                  >
                    Sign Up
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
