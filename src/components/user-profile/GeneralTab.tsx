"use client";
import React, { useRef, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ErrorMessage, Formik } from "formik";
import * as Yup from "yup";
import { BeatLoader } from "react-spinners";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import {
  deleteAssetByType,
  getUserDetail,
  updateUserProfile,
} from "@/store/user/actions";
import { getAuthToken } from "@/utils/authCookies";
import { toast } from "react-toastify";

const GeneralTab = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, deletingImage, isFetchingUser } = useAppSelector(
    (state) => state.user
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    description: Yup.string().required("Description is required"),
    userName: Yup.string().required("Username is required"),
  });

  const initialValues = {
    name: user?.name || "",
    description: user?.description || "",
    userName: user?.userName || "",
    image: user?.image || null,
    banner: user?.banner || null,
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      formData.append("userName", values.userName);
      // Don't append images here since they're uploaded separately

      //   Send the form data to the backend
      dispatch(
        updateUserProfile({
          payload: formData,
          onSuccess: async () => {
            toast.success("Profile updated successfully.");
            const token = getAuthToken();
            if (token) {
              await dispatch(getUserDetail());
            }
          },
        })
      );
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleImageUpload = async (file: File, type: "image" | "banner") => {
    try {
      if (type === "image") {
        setImageUploading(true);
      } else {
        setBannerUploading(true);
      }

      const formData = new FormData();
      formData.append(type, file);
      formData.append("type", type);

      dispatch(
        updateUserProfile({
          payload: formData,
          onSuccess: async () => {
            toast.success(`${type} uploaded successfully`);
            const token = getAuthToken();
            if (token) {
              await dispatch(getUserDetail());
            }
          },
        })
      );
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
    } finally {
      if (type === "image") {
        setImageUploading(false);
      } else {
        setBannerUploading(false);
      }
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "image" | "banner",
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 1024 * 1024) {
        toast.error("File size must be less than or equal to 1MB");
        return;
      }

      setFieldValue(fieldName, file);

      const previewUrl = URL.createObjectURL(file);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      fieldName === "image" ? setImagePreview(previewUrl) : setBannerPreview(previewUrl);

      handleImageUpload(file, fieldName);
    }
  };

  const handleRemove = (
    fieldName: "image" | "banner",
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue(fieldName, null);

    dispatch(deleteAssetByType(fieldName))
      .unwrap()
      .then(() => {
        setImagePreview(null);
        setBannerPreview(null);
        dispatch(getUserDetail());
      })
      .catch((error: any) => {
        console.error(`Failed to delete ${fieldName}:`, error);
      });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
        General
      </h3>
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
                {/* Hidden file inputs */}
                <input
                  type="file"
                  ref={bannerInputRef}
                  onChange={(e) => handleFileChange(e, "banner", setFieldValue)}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleFileChange(e, "image", setFieldValue)}
                  accept="image/jpeg,image/png"
                  className="hidden"
                />
                {/* Change Banner Section */}
                <div className="bg-[#090e15] rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-5">
                    <div className="flex-1">
                      <h2 className="text-white text-base sm:text-lg font-medium mb-1">
                        Change Banner
                      </h2>
                      <div className="text-[#7A8895] text-xs sm:text-sm">
                        Upload file max 1MB (JPEG or PNG)
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={bannerUploading}
                        className="flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-[#141f2c] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bannerUploading ? (
                          <BeatLoader color="#ffffff" size={12} />
                        ) : (
                          <>
                            <Pencil size={16} className="flex-shrink-0" />
                            <span>Edit</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove("banner", setFieldValue)}
                        disabled={bannerUploading || deletingImage || !values.banner}
                        className="flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#ff3f3c] bg-[#3a181d] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash size={16} className="flex-shrink-0" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                  {/* Banner Preview */}
                  <div className="relative w-full aspect-[3/1] bg-gradient-to-r from-blue-400 to-green-400 rounded-lg overflow-hidden">
                    {bannerUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                        <BeatLoader color="#13F195" size={12} />
                      </div>
                    )}
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="object-cover w-full h-full"
                      />
                    ) : typeof values.banner === "string" ? (
                      <Image
                        src={values.banner}
                        alt="Banner"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src="/images/defaultBanner.png"
                        alt="Default Banner"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>
                {/* Change Profile Picture Section */}
                <div className="bg-[#090e15] rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-700 relative">
                      {imageUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center z-10">
                          <BeatLoader color="#13F195" size={8} />
                        </div>
                      )}
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : values.image ? (
                        <Image
                          width={80}
                          height={80}
                          src={values.image as string}
                          alt="User profile"
                          className="object-cover w-full h-full rounded-full"
                        />
                      ) : (
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.9998 13C14.7612 13 16.9998 10.7614 16.9998 8C16.9998 5.23858 14.7612 3 11.9998 3C9.23833 3 6.99976 5.23858 6.99976 8C6.99976 10.7614 9.23833 13 11.9998 13Z"
                            fill="#13F195"
                          />
                          <path
                            d="M21.8 18.0992C20.9 16.2992 19.2 14.7992 17 13.8992C16.4 13.6992 15.7 13.6992 15.2 13.9992C14.2 14.5992 13.2 14.8992 12 14.8992C10.8 14.8992 9.79997 14.5992 8.79997 13.9992C8.29997 13.7992 7.59997 13.6992 6.99997 13.9992C4.79997 14.8992 3.09997 16.3992 2.19997 18.1992C1.49997 19.4992 2.59997 20.9992 4.09997 20.9992H19.9C21.4 20.9992 22.5 19.4992 21.8 18.0992Z"
                            fill="#13F195"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-white text-base sm:text-lg font-medium mb-1">
                        Change Avatar
                      </h2>
                      <div className=" text-xs sm:text-sm">
                        <span
                          onClick={() => imageInputRef.current?.click()}
                          className="text-[#13F195] hover:opacity-90 underline mr-1"
                        >
                          Upload file
                        </span>
                        <span className="text-[#7A8895]">max 1MB (JPEG or PNG)</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={imageUploading}
                        className="flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-[#141f2c] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {imageUploading ? (
                          <BeatLoader color="#ffffff" size={12} />
                        ) : (
                          <>
                            <Pencil size={16} className="flex-shrink-0" />
                            <span>Edit</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove("image", setFieldValue)}
                        disabled={imageUploading || deletingImage || !values.image}
                        className="flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#ff3f3c] bg-[#3a181d] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash size={16} className="flex-shrink-0" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Name and Description Fields */}
                <div className="px-2 pb-3">
                  <div className="space-y-4 mt-7">
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
                    <div>
                      <Label>Username</Label>
                      <Input
                        type="text"
                        id="userName"
                        name="userName"
                        placeholder="Enter your username"
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
                    {/* <!-- Description --> */}
                    <div>
                      <Label>Description</Label>
                      <Input
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Enter description here..."
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.description}
                      />
                      <ErrorMessage
                        name="description"
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
  );
};

export default GeneralTab;
