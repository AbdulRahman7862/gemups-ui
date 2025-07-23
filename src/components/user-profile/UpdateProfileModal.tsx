import React, { useEffect, useRef, useState } from "react";
import { Modal } from "../ui/modal";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import { ArrowLeftRight, FileImage } from "lucide-react";
import { updateUserProfile } from "@/store/user/actions";
import { toast } from "react-toastify";

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.image) {
      setImagePreview(user.image);
    }
  }, [user?.image]);

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    image: Yup.mixed()
      .nullable()
      .test(
        "fileSize",
        "File too large (max 1MB)",
        (value) => !value || (value instanceof File && value.size <= 1024 * 1024) // 1MB
      )
      .test(
        "fileFormat",
        "Unsupported format (JPEG or PNG only)",
        (value) =>
          !value ||
          (value instanceof File && ["image/jpeg", "image/png"].includes(value.type))
      ),
  });

  const initialValues = {
    name: user?.name || "",
    email: user?.email || "",
    image: null as File | null,
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      //   formData.append("email", values.email);
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      //   Send the form data to the backend
      dispatch(
        updateUserProfile({
          payload: formData,
          onSuccess: () => {
            toast.success("Profile updated successfully.");
            onClose();
          },
        })
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue("image", file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-[#030507] lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Personal Information
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update your details to keep your profile up-to-date.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, handleSubmit, handleChange, handleBlur }) => {
            return (
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                  <div className="mt-7">
                    <div className="space-y-4">
                      {/* Image Upload */}
                      <div className="flex flex-col items-center">
                        <div className="relative group">
                          <div
                            className="w-32 h-32 rounded-full bg-[#030507] flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-brand-500 transition-colors"
                            onClick={triggerFileInput}
                          >
                            {imagePreview || user?.image ? (
                              <>
                                <img
                                  src={imagePreview || user?.image}
                                  alt="Profile preview"
                                  className="w-full h-full object-cover"
                                />
                                {/* Change overlay on hover */}
                                <div className="absolute rounded-full inset-0 bg-black bg-opacity-10 flex items-center justify-center opacity-0 group-hover:opacity-80 transition-opacity">
                                  <ArrowLeftRight size={24} className="text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center">
                                <FileImage size={24} className="text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Click to upload
                                </span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleImageChange(e, setFieldValue)}
                            onBlur={handleBlur}
                            accept="image/*"
                            className="hidden"
                            name="image"
                          />
                        </div>
                        <ErrorMessage
                          name="image"
                          component="div"
                          className="text-red-500 text-xs mt-1 text-center"
                        />
                      </div>

                      {/* <!-- Name --> */}
                      <div>
                        <Label>
                          Name<span className="text-error-500">*</span>
                        </Label>
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
                      {/* <!-- Email --> */}
                      <div>
                        <Label>
                          Email<span className="text-error-500">*</span>
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          disabled
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
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-3 text-sm font-medium transition rounded-lg text-gray-400 bg-gray-800 shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-3 text-sm font-medium transition rounded-lg bg-[#13F195] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <BeatLoader color="#030507" size={10} />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            );
          }}
        </Formik>
      </div>
    </Modal>
  );
};

export default UpdateProfileModal;
