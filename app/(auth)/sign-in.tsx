import "@/global.css";
import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SafeAreaViewStyled = styled(SafeAreaView);
const ScrollViewStyled = styled(ScrollView);
const ViewStyled = styled(View);
const PressableStyled = styled(Pressable);
const TextInputStyled = styled(TextInput);
const TextStyled = styled(Text);

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localErrors, setLocalErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setLocalErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (error) {
        console.error("Sign in error:", JSON.stringify(error, null, 2));
        setLocalErrors((prev) => ({
          ...prev,
          general:
            error.code === "form_password_incorrect"
              ? "Invalid email or password"
              : error.message || "Sign in failed. Please try again.",
        }));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            // Handle session tasks
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }

            // Navigate to home
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              // Web only
              window.location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      } else if (signIn.status === "needs_second_factor") {
        // Handle MFA if needed
        console.log("MFA required");
      } else if (signIn.status === "needs_client_trust") {
        console.log("Client trust challenge required");
      } else {
        setLocalErrors((prev) => ({
          ...prev,
          general: "Sign in attempt failed. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      setLocalErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    }
  };

  const isLoading = fetchStatus === "fetching";
  const isFormValid =
    email && password && !localErrors.email && !localErrors.password;

  return (
    <SafeAreaViewStyled className="auth-safe-area">
      <ScrollViewStyled
        className="auth-scroll"
        contentContainerClassName="flex-grow"
        showsVerticalScrollIndicator={false}
      >
        <ViewStyled className="auth-content">
          {/* Brand Logo */}
          <ViewStyled className="auth-brand-block">
            <ViewStyled className="auth-logo-wrap">
              <ViewStyled className="auth-logo-mark">
                <TextStyled className="auth-logo-mark-text">T</TextStyled>
              </ViewStyled>
              <ViewStyled>
                <TextStyled className="auth-wordmark">Turbo Money</TextStyled>
              </ViewStyled>
            </ViewStyled>
          </ViewStyled>

          {/* Title and Subtitle */}
          <ViewStyled className="mt-12">
            <TextStyled className="auth-title">                Welcome back</TextStyled>
            <TextStyled className="auth-subtitle">          {" "}Sign in to continue managing your</TextStyled>
            <TextStyled className="auth-subtitle">        SUBSCRIPTIONS</TextStyled>
          </ViewStyled>

          {/* Form Card */}
          <ViewStyled className="auth-card">
            <ViewStyled className="auth-form">
              {/* Email Field */}
              <ViewStyled className="auth-field">
                <TextStyled className="auth-label">Email Address</TextStyled>
                <TextInputStyled
                  className={`auth-input ${
                    localErrors.email ? "auth-input-error" : ""
                  }`}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (localErrors.email) {
                      setLocalErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  editable={!isLoading}
                />
                {localErrors.email && (
                  <TextStyled className="auth-error">
                    {localErrors.email}
                  </TextStyled>
                )}
              </ViewStyled>

              {/* Password Field */}
              <ViewStyled className="auth-field">
                <TextStyled className="auth-label">Password</TextStyled>
                <TextInputStyled
                  className={`auth-input ${
                    localErrors.password ? "auth-input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (localErrors.password) {
                      setLocalErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  editable={!isLoading}
                />
                {localErrors.password && (
                  <TextStyled className="auth-error">
                    {localErrors.password}
                  </TextStyled>
                )}
              </ViewStyled>

              {/* General Error */}
              {localErrors.general && (
                <ViewStyled className="rounded-2xl bg-destructive/10 px-4 py-3">
                  <TextStyled className="text-sm font-sans-medium text-destructive">
                    {localErrors.general}
                  </TextStyled>
                </ViewStyled>
              )}

              {/* Sign In Button */}
              <PressableStyled
                className={`auth-button ${
                  !isFormValid || isLoading ? "auth-button-disabled" : ""
                }`}
                onPress={handleSignIn}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="rgba(8, 17, 38, 0.5)"
                  />
                ) : (
                  <TextStyled className="auth-button-text">Sign in</TextStyled>
                )}
              </PressableStyled>

              {/* Navigation Link */}
              <ViewStyled className="auth-link-row">
                <TextStyled className="auth-link-copy">
                  New to Turbo Money?{" "}
                </TextStyled>
                <Link href="/(auth)/sign-up">
                  <TextStyled className="auth-link">
                    Create an account
                  </TextStyled>
                </Link>
              </ViewStyled>
            </ViewStyled>
          </ViewStyled>
        </ViewStyled>
      </ScrollViewStyled>
    </SafeAreaViewStyled>
  );
}
