import "@/global.css";
import { useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
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
import { styled } from "nativewind";

const SafeAreaViewStyled = styled(SafeAreaView);
const ScrollViewStyled = styled(ScrollView);
const ViewStyled = styled(View);
const PressableStyled = styled(Pressable);
const TextInputStyled = styled(TextInput);
const TextStyled = styled(Text);

type SignUpStep = "form" | "verification";

export default function SignUp() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<SignUpStep>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [localErrors, setLocalErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    code: "",
    general: "",
  });

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      code: "",
      general: "",
    };

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setLocalErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const validateCode = () => {
    if (!verificationCode) {
      setLocalErrors((prev) => ({
        ...prev,
        code: "Verification code is required",
      }));
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
      });

      if (error) {
        console.error("Sign up error:", JSON.stringify(error, null, 2));
        setLocalErrors((prev) => ({
          ...prev,
          general: error.message || "Sign up failed. Please try again.",
        }));
        return;
      }

      // Send verification email
      await signUp.verifications.sendEmailCode();
      setStep("verification");
      setLocalErrors((prev) => ({ ...prev, general: "" }));
    } catch (error) {
      console.error("Unexpected error:", error);
      setLocalErrors((prev) => ({
        ...prev,
        general: "An unexpected error occurred. Please try again.",
      }));
    }
  };

  const handleVerify = async () => {
    if (!validateCode()) return;

    try {
      await signUp.verifications.verifyEmailCode({
        code: verificationCode,
      });

      if (signUp.status === "complete") {
        await signUp.finalize({
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
      } else {
        setLocalErrors((prev) => ({
          ...prev,
          general: "Verification failed. Please check your code and try again.",
        }));
      }
    } catch (error) {
      console.error("Verification error:", error);
      setLocalErrors((prev) => ({
        ...prev,
        general: "Invalid verification code. Please try again.",
      }));
    }
  };

  const handleResendCode = async () => {
    try {
      await signUp.verifications.sendEmailCode();
      setLocalErrors((prev) => ({
        ...prev,
        general: "",
        code: "",
      }));
    } catch (error) {
      console.error("Resend error:", error);
      setLocalErrors((prev) => ({
        ...prev,
        general: "Failed to resend code. Please try again.",
      }));
    }
  };

  const handleBackToForm = () => {
    setStep("form");
    setVerificationCode("");
    setLocalErrors({
      email: "",
      password: "",
      confirmPassword: "",
      code: "",
      general: "",
    });
  };

  const isLoading = fetchStatus === "loading";

  if (step === "verification") {
    const isFormValid = verificationCode && !localErrors.code;

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
                  <TextStyled className="auth-wordmark">turbo-money</TextStyled>
                  <TextStyled className="auth-wordmark-sub">
                    Subscription Manager
                  </TextStyled>
                </ViewStyled>
              </ViewStyled>
            </ViewStyled>

            {/* Title and Subtitle */}
            <ViewStyled className="mt-12">
              <TextStyled className="auth-title">Verify your email</TextStyled>
              <TextStyled className="auth-subtitle">
                We sent a verification code to {email}
              </TextStyled>
            </ViewStyled>

            {/* Form Card */}
            <ViewStyled className="auth-card">
              <ViewStyled className="auth-form">
                {/* Verification Code Field */}
                <ViewStyled className="auth-field">
                  <TextStyled className="auth-label">Verification Code</TextStyled>
                  <TextInputStyled
                    className={`auth-input ${
                      localErrors.code ? "auth-input-error" : ""
                    }`}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(8, 17, 38, 0.4)"
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={(text) => {
                      setVerificationCode(text);
                      if (localErrors.code) {
                        setLocalErrors((prev) => ({ ...prev, code: "" }));
                      }
                    }}
                    maxLength={6}
                    editable={!isLoading}
                  />
                  {localErrors.code && (
                    <TextStyled className="auth-error">
                      {localErrors.code}
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

                {/* Verify Button */}
                <PressableStyled
                  className={`auth-button ${
                    !isFormValid || isLoading ? "auth-button-disabled" : ""
                  }`}
                  onPress={handleVerify}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color="rgba(8, 17, 38, 0.5)"
                    />
                  ) : (
                    <TextStyled className="auth-button-text">Verify</TextStyled>
                  )}
                </PressableStyled>

                {/* Resend Code Button */}
                <PressableStyled
                  className="auth-secondary-button"
                  onPress={handleResendCode}
                  disabled={isLoading}
                >
                  <TextStyled className="auth-secondary-button-text">
                    Didn&apos;t receive code? Resend
                  </TextStyled>
                </PressableStyled>

                {/* Back Button */}
                <PressableStyled
                  className="auth-secondary-button"
                  onPress={handleBackToForm}
                  disabled={isLoading}
                >
                  <TextStyled className="auth-secondary-button-text">
                    Back to sign up
                  </TextStyled>
                </PressableStyled>
              </ViewStyled>
            </ViewStyled>
          </ViewStyled>
        </ScrollViewStyled>
      </SafeAreaViewStyled>
    );
  }

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    !localErrors.email &&
    !localErrors.password &&
    !localErrors.confirmPassword;

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
                <TextStyled className="auth-wordmark">turbo-money</TextStyled>
                <TextStyled className="auth-wordmark-sub">
                  Subscription Manager
                </TextStyled>
              </ViewStyled>
            </ViewStyled>
          </ViewStyled>

          {/* Title and Subtitle */}
          <ViewStyled className="mt-12">
            <TextStyled className="auth-title">Create an account</TextStyled>
            <TextStyled className="auth-subtitle">
              Start managing your subscriptions smarter today
            </TextStyled>
          </ViewStyled>

          {/* Form Card */}
          <ViewStyled className="auth-card">
            <ViewStyled className="auth-form">
              {/* Email Field */}
              <ViewStyled className="auth-field">
                <TextStyled className="auth-label">Email</TextStyled>
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
                  placeholder="At least 8 characters"
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
                {!localErrors.password && password && (
                  <TextStyled className="auth-helper">
                    ✓ Password strength: Good
                  </TextStyled>
                )}
              </ViewStyled>

              {/* Confirm Password Field */}
              <ViewStyled className="auth-field">
                <TextStyled className="auth-label">Confirm Password</TextStyled>
                <TextInputStyled
                  className={`auth-input ${
                    localErrors.confirmPassword ? "auth-input-error" : ""
                  }`}
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(8, 17, 38, 0.4)"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (localErrors.confirmPassword) {
                      setLocalErrors((prev) => ({
                        ...prev,
                        confirmPassword: "",
                      }));
                    }
                  }}
                  editable={!isLoading}
                />
                {localErrors.confirmPassword && (
                  <TextStyled className="auth-error">
                    {localErrors.confirmPassword}
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

              {/* Sign Up Button */}
              <PressableStyled
                className={`auth-button ${
                  !isFormValid || isLoading ? "auth-button-disabled" : ""
                }`}
                onPress={handleSignUp}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="rgba(8, 17, 38, 0.5)"
                  />
                ) : (
                  <TextStyled className="auth-button-text">Sign up</TextStyled>
                )}
              </PressableStyled>

              {/* Navigation Link */}
              <ViewStyled className="auth-link-row">
                <TextStyled className="auth-link-copy">
                  Already have an account?{" "}
                </TextStyled>
                <Link href="/(auth)/sign-in">
                  <TextStyled className="auth-link">Sign in</TextStyled>
                </Link>
              </ViewStyled>
            </ViewStyled>
          </ViewStyled>
        </ViewStyled>
      </ScrollViewStyled>
    </SafeAreaViewStyled>
  );
}
