import images from "@/constants/images";
import "@/global.css";
import { useProfilePicture } from "@/lib/ProfileContext";
import { useClerk, useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import clsx from "clsx";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const ViewStyled = styled(View);
const PressableStyled = styled(Pressable);
const TextStyled = styled(Text);
const ScrollViewStyled = styled(ScrollView);
const TextInputStyled = styled(TextInput);
const KeyboardAvoidingViewStyled = styled(KeyboardAvoidingView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const initializeRef = useRef(false);
  const { profileImageUri, updateProfilePicture, isLoading: isImageLoading } =
    useProfilePicture();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageLoadingMessage, setImageLoadingMessage] = useState("");

  useEffect(() => {
    if (isLoaded && user && !initializeRef.current) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      initializeRef.current = true;
    }
  }, [isLoaded, user]);

  const handlePickImage = async () => {
    try {
      setImageLoadingMessage("Uploading...");
      setErrorMessage("");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        aspect: [1, 1],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await updateProfilePicture(imageUri);
        setImageLoadingMessage("");
        setSuccessMessage("Profile photo updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setImageLoadingMessage("");
      }
    } catch (error) {
      console.error("Image picker error:", error);
      setImageLoadingMessage("");
      setErrorMessage("Failed to update profile photo. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("First name and last name are required");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingViewStyled
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollViewStyled
          contentContainerClassName="pb-30 p-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <TextStyled className="text-2xl font-sans-bold text-primary mb-6">
            Settings
          </TextStyled>

          {/* Profile Header Section */}
          <ViewStyled className="items-center mb-8">
            <PressableStyled
              className="mb-4 opacity-100 active:opacity-70"
              onPress={handlePickImage}
              disabled={isImageLoading}
            >
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  className="w-20 h-20 rounded-full"
                />
              ) : user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <Image
                  source={images.avatar}
                  className="w-20 h-20 rounded-full"
                />
              )}
            </PressableStyled>

            <TextStyled className="text-xl font-sans-bold text-primary mb-1">
              {user?.fullName || "User"}
            </TextStyled>

            <TextStyled className="text-sm font-sans-medium text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress || "No email"}
            </TextStyled>
          </ViewStyled>

          {/* Divider */}
          <ViewStyled className="h-px bg-border mb-8" />

          {/* Edit Profile Section */}
          <ViewStyled className="mb-8">
            <TextStyled className="text-lg font-sans-bold text-primary mb-4">
              Edit Profile
            </TextStyled>

            {/* Success Message */}
            {successMessage && (
              <ViewStyled className="mb-4 rounded-2xl bg-success/10 border border-success p-3">
                <TextStyled className="text-sm font-sans-medium text-success">
                  {successMessage}
                </TextStyled>
              </ViewStyled>
            )}

            {/* Error Message */}
            {errorMessage && (
              <ViewStyled className="mb-4 rounded-2xl bg-destructive/10 border border-destructive p-3">
                <TextStyled className="text-sm font-sans-medium text-destructive">
                  {errorMessage}
                </TextStyled>
              </ViewStyled>
            )}

            {/* Image Loading Message */}
            {imageLoadingMessage && (
              <ViewStyled className="mb-4 rounded-2xl bg-blue-500/10 border border-blue-500 p-3">
                <TextStyled className="text-sm font-sans-medium text-blue-500">
                  {imageLoadingMessage}
                </TextStyled>
              </ViewStyled>
            )}

            {/* Change Photo Button */}
            <PressableStyled
              className={clsx(
                "mb-4 items-center justify-center rounded-2xl border-2 border-primary py-3",
                isImageLoading && "opacity-70",
              )}
              onPress={handlePickImage}
              disabled={isImageLoading}
            >
              <TextStyled className="text-base font-sans-bold text-primary">
                {isImageLoading ? "Uploading Photo..." : "Change Profile Photo"}
              </TextStyled>
            </PressableStyled>

            {/* First Name */}
            <ViewStyled className="auth-field mb-4">
              <TextStyled className="auth-label mb-2">First Name</TextStyled>
              <TextInputStyled
                className="auth-input"
                placeholder="Enter first name"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  setErrorMessage("");
                }}
                editable={!loading}
              />
            </ViewStyled>

            {/* Last Name */}
            <ViewStyled className="auth-field mb-6">
              <TextStyled className="auth-label mb-2">Last Name</TextStyled>
              <TextInputStyled
                className="auth-input"
                placeholder="Enter last name"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  setErrorMessage("");
                }}
                editable={!loading}
              />
            </ViewStyled>

            {/* Save Button */}
            <PressableStyled
              className={clsx(
                "auth-button items-center justify-center rounded-2xl py-4",
                loading && "auth-button-disabled",
              )}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <TextStyled className="auth-button-text font-sans-bold">
                {loading ? "Saving..." : "Save Changes"}
              </TextStyled>
            </PressableStyled>
          </ViewStyled>

          {/* Divider */}
          <ViewStyled className="h-px bg-border mb-8" />

          {/* Account Section */}
          <ViewStyled className="mb-4">
            <TextStyled className="text-lg font-sans-bold text-primary mb-4">
              Account
            </TextStyled>

            {/* Sign Out Button */}
            <PressableStyled
              className="items-center justify-center rounded-2xl border-2 border-destructive bg-destructive/10 py-4"
              onPress={handleSignOut}
            >
              <TextStyled className="text-base font-sans-bold text-destructive">
                Sign Out
              </TextStyled>
            </PressableStyled>
          </ViewStyled>
        </ScrollViewStyled>
      </KeyboardAvoidingViewStyled>
    </SafeAreaView>
  );
};

export default Settings;
