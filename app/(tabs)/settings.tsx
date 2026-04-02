import "@/global.css";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const ViewStyled = styled(View);
const PressableStyled = styled(Pressable);
const TextStyled = styled(Text);

const Settings = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ViewStyled className="flex-1">
        <TextStyled className="text-2xl font-sans-bold text-primary">
          Settings
        </TextStyled>

        <ViewStyled className="mt-auto mb-10 gap-3">
          <PressableStyled
            className="auth-button"
            onPress={handleSignOut}
          >
            <TextStyled className="auth-button-text">Sign out</TextStyled>
          </PressableStyled>
        </ViewStyled>
      </ViewStyled>
    </SafeAreaView>
  );
};

export default Settings;
