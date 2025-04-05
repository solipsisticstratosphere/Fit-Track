"use client";

import type React from "react";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Loader2,
  Upload,
  Save,
  Lock,
  AlertTriangle,
  User,
  Mail,
  ChevronRight,
} from "lucide-react";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  cloudinaryPublicId?: string | null;
};

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    imageUrl: "",
    cloudinaryPublicId: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchUserProfile(session.user.id);
    }
  }, [status, session, router]);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      setUserProfile(data);
      setFormData({
        name: data.name || "",
        email: data.email,
        imageUrl: data.imageUrl || "",
        cloudinaryPublicId: data.cloudinaryPublicId || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<{
    imageUrl: string;
    cloudinaryPublicId: string;
  } | null> => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Image upload failed");

      const data = await response.json();
      return {
        imageUrl: data.imageUrl,
        cloudinaryPublicId: data.publicId,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;

    try {
      setIsSaving(true);

      let imageUrl = formData.imageUrl;
      let cloudinaryPublicId = formData.cloudinaryPublicId;

      if (selectedImage) {
        const uploadResult = await uploadImage();
        if (uploadResult) {
          imageUrl = uploadResult.imageUrl;
          cloudinaryPublicId = uploadResult.cloudinaryPublicId;
        }
      }

      const response = await fetch(`/api/users/${userProfile.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          imageUrl,
          cloudinaryPublicId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      await update({
        ...session,
        user: {
          ...session.user,
          name: formData.name,
          image: imageUrl,
        },
      });

      fetchUserProfile(userProfile.id);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <User className="mr-3 h-8 w-8 text-indigo-600" />
          Your Profile
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
        <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
            <User className="mr-2 h-5 w-5 text-indigo-600" />
            Personal Information
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-8 items-center">
            <div className="relative group">
              <div className="h-36 w-36 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                {previewUrl || formData.imageUrl ? (
                  <img
                    src={previewUrl || formData.imageUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-indigo-100">
                    <Camera className="h-14 w-14 text-indigo-300" />
                  </div>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white p-2.5 rounded-full cursor-pointer shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105"
                tabIndex={0}
                aria-label="Upload profile image"
              >
                <Upload className="h-5 w-5" />
                <input
                  type="file"
                  id="profile-image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 flex items-center">
                  <Lock className="h-3 w-3 mr-1" />
                  Email cannot be changed
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:-translate-y-0.5"
              aria-label="Save profile"
              tabIndex={0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
        <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100">
          <h2 className="text-xl font-semibold text-indigo-800 flex items-center">
            <Lock className="mr-2 h-5 w-5 text-indigo-600" />
            Account Security
          </h2>
        </div>
        <div className="p-6">
          <div className="border-b border-gray-200 pb-5 mb-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Lock className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Change Password
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Update your password regularly to maintain account security
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile/change-password")}
            className="inline-flex items-center px-5 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Change password"
            tabIndex={0}
          >
            Change Password
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="px-6 py-5 bg-red-50 border-b border-red-100">
          <h2 className="text-xl font-semibold text-red-800 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
            Danger Zone
          </h2>
        </div>
        <div className="p-6">
          <div className="border-b border-gray-200 pb-5 mb-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Permanently delete your account and all your data. This action
                  cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/profile/delete-account")}
            className="inline-flex items-center px-5 py-3 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Delete account"
            tabIndex={0}
          >
            Delete Account
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
