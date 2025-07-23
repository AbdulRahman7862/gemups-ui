import React from "react";
import { Modal } from "../ui/modal";
import { BeatLoader } from "react-spinners";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getAuthToken } from "@/utils/authCookies";
import { getUserDetail, updateUserProfile } from "@/store/user/actions";
import { toast } from "react-toastify";

const EmailModal = ({ isOpen, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required")
      .max(254, "Email address is too long")
      .test(
        "not-same",
        "New email must be different from current email",
        (value) => value !== user?.email
      )
      .test("valid-domain", "Email domain appears to be invalid", (value) => {
        if (!value) return true;

        const domain = value.split("@")[1];
        if (!domain) return false;

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
        return domainRegex.test(domain);
      })
      .test("no-consecutive-dots", "Email cannot contain consecutive dots", (value) => {
        if (!value) return true;
        return !value.includes("..");
      })
      .test("valid-local-part", "Email format is invalid", (value) => {
        if (!value) return true;

        const localPart = value.split("@")[0];
        if (!localPart) return false;

        if (localPart.startsWith(".") || localPart.endsWith(".")) {
          return false;
        }

        const localPartRegex = /^[a-zA-Z0-9._%+-]+$/;
        return localPartRegex.test(localPart);
      }),
  });

  const initialValues = {
    email: "",
  };

  const handleSubmit = async (values: any) => {
    try {
      const emailValue = values.email.trim().toLowerCase();

      if (!emailValue) {
        toast.error("Please enter an email address");
        return;
      }

      const formData = new FormData();
      formData.append("email", emailValue);

      dispatch(
        updateUserProfile({
          payload: formData,
          onSuccess: async () => {
            toast.success("Email updated successfully.");
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
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] bg-[#090E15] p-6 rounded-xl"
    >
      <h4 className="font-bold text-white text-[24px] mb-6">Change Email</h4>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, handleChange, handleBlur, errors, touched }) => {
          return (
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="px-2 pb-3">
                <div className="space-y-4 my-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your new email address"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      className={`${
                        errors.email && touched.email
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                    {user?.email && (
                      <div className="text-gray-400 text-xs mt-1">
                        Current email: {user.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 bg-[#13F195] text-black font-semibold rounded-lg hover:bg-[#0ddb7f] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <BeatLoader color="#030507" size={10} /> : "Change Email"}
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
