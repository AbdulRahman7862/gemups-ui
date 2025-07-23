import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { BeatLoader } from "react-spinners";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { encryptData } from "@/utils/crypto";
import { getAuthToken } from "@/utils/authCookies";
import { getUserDetail, updateUserPassword } from "@/store/user/actions";

const EmailModal = ({ isOpen, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRNewPassword, setShowRNewPassword] = useState(false);

  // Validation schema
  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .required("Current Password is required")
      .min(8, "Password must be at least 8 characters"),
    newPassword: Yup.string()
      .required("New Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      )
      .notOneOf(
        [Yup.ref("currentPassword")],
        "New password must be different from current password"
      ),
    repeatNewPassword: Yup.string()
      .required("Please confirm your new password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const initialValues = {
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        currentPassword: encryptData(values.currentPassword),
        newPassword: encryptData(values.newPassword),
      };

      //   Send the form data to the backend
      await dispatch(
        updateUserPassword({
          payload,
          onSuccess: async () => {
            const token = getAuthToken();
            if (token) {
              await dispatch(getUserDetail());
            }
            onClose();
          },
        })
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] bg-[#090E15] p-6 rounded-xl"
    >
      <h4 className="font-bold text-white text-[24px] mb-6">Change Password</h4>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, handleChange, handleBlur }) => {
          return (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="px-2 pb-3">
                <div className="space-y-4 my-4">
                  {/* <!-- Current Password --> */}
                  <div>
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input
                        name="currentPassword"
                        placeholder="Enter your current password"
                        type={showCurrentPassword ? "text" : "password"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.currentPassword}
                      />
                      <span
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showCurrentPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    <ErrorMessage
                      name="currentPassword"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  {/* <!-- New Password --> */}
                  <div>
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input
                        name="newPassword"
                        placeholder="Enter your new password"
                        type={showNewPassword ? "text" : "password"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.newPassword}
                      />
                      <span
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showNewPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    <ErrorMessage
                      name="newPassword"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  {/* <!-- Repeat New Password --> */}
                  <div>
                    <Label>Repeat New Password</Label>
                    <div className="relative">
                      <Input
                        name="repeatNewPassword"
                        placeholder="Confirm your new password"
                        type={showRNewPassword ? "text" : "password"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.repeatNewPassword}
                      />
                      <span
                        onClick={() => setShowRNewPassword(!showRNewPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showRNewPassword ? (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </span>
                    </div>
                    <ErrorMessage
                      name="repeatNewPassword"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#13F195] text-black font-semibold rounded-lg hover:bg-[#0ddb7f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <BeatLoader color="#030507" size={10} />
                  ) : (
                    "Change Password"
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#1E2836] text-white rounded-lg font-medium hover:bg-[#2C3A4D] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </Modal>
  );
};

export default EmailModal;
