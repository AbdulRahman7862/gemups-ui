"use client";
import React, { useState } from "react";
import { MoveLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ShieldX } from "lucide-react";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { BeatLoader } from "react-spinners";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { getOrCreateDeviceIdClient } from "@/utils/deviceId";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { encryptData } from "@/utils/crypto";
import { signUpGuestUser } from "@/store/user/actions";
import { useRouter } from "next/navigation";

const ProfileSettingsGuest = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);
  const [showPassword, setShowPassword] = useState(false);

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    userName: Yup.string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
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
    name: user?.name || "",
    userName: user?.userName || "",
    email: user?.email || "",
    password: user?.password || "",
  };

  const handleSubmit = async (values: any) => {
    try {
      // Get UID
      const userUID = getOrCreateDeviceIdClient();

      // Send the required fields as a plain object, not FormData
      dispatch(
        signUpGuestUser({
          payload: {
            email: values.email,
            password: encryptData(values.password),
            // If you want to send more fields, add them here and update SignupData/backend as needed
            // name: values.name,
            // userName: values.userName,
            // uid: userUID,
          },
          onSuccess: () => {
            // Force a storage event to trigger hooks
            window.dispatchEvent(new Event("storage"));
          },
        })
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <button
          onClick={() => {
            router.back();
          }}
          type="button"
          className="flex items-center text-sm font-medium text-[#13F195] hover:opacity-90 transition-colors"
        >
          <MoveLeft size={14} className="mr-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Unverified Seller Banner */}
      <div className="bg-[#35310a] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-[#5c540c] rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldX size={18} className="text-[#f1d713]" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-1 sm:mb-2">Unverified Seller</h3>
            <p className="text-[#7a8895] text-sm">
              To show your products to buyers visit yourself. Currently your products can
              be seen only via direct links.
            </p>
          </div>
        </div>
        <button className="text-[#f1d713] hover:opacity-90 underline text-sm font-medium transition-colors self-start sm:self-center whitespace-nowrap">
          Get Verification
        </button>
      </div>

      {/* General Guset settings form */}
      <div>
        <div className="space-y-4">
          {/* General Settings */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, handleSubmit, handleChange, handleBlur }) => {
              return (
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
                    General
                  </h3>

                  {/* Name and Description Fields */}
                  <div className="px-2 pb-3">
                    <div className="space-y-4">
                      {/* <!-- Name --> */}
                      <div>
                        <Label>Name</Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter your name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.name}
                        />
                        <ErrorMessage
                          name="name"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      {/* <!-- UserName --> */}
                      <div>
                        <Label>Username</Label>
                        <Input
                          type="text"
                          id="userName"
                          name="userName"
                          placeholder="Enter your user name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.userName}
                        />
                        <ErrorMessage
                          name="userName"
                          component="div"
                          className="text-red-500 text-xs mt-1"
                        />
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6 !ml-[-10px]">
                        Privacy
                      </h3>

                      {/* <!-- Email --> */}
                      <div>
                        <Label>Email</Label>
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
                        <Label>Password</Label>
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
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-2 mt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center justify-center px-4 py-3 text-sm font-medium transition rounded-lg bg-[#13F195] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <BeatLoader color="#030507" size={10} /> : "Save"}
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsGuest;
