import * as FileSystem from "expo-file-system/legacy";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ProfileContextType {
  profileImageUri: string | null;
  updateProfilePicture: (imageUri: string) => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const PROFILE_CONFIG_FILE = `${FileSystem.documentDirectory}profile.json`;

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored profile image URI on app startup
  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const fileContent =
        await FileSystem.readAsStringAsync(PROFILE_CONFIG_FILE);
      const config = JSON.parse(fileContent);
      setProfileImageUri(config.profileImageUri || null);
    } catch (error) {
      // File doesn't exist yet, that's fine
      setProfileImageUri(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (imageUri: string) => {
    try {
      setIsLoading(true);

      // Generate a unique filename for the profile picture
      const fileName = `profile-pic-${Date.now()}.jpg`;
      const targetPath = `${FileSystem.cacheDirectory}${fileName}`;

      // Copy image to cache directory
      await FileSystem.copyAsync({
        from: imageUri,
        to: targetPath,
      });

      // Save the URI reference to config file
      const config = { profileImageUri: targetPath };
      await FileSystem.writeAsStringAsync(
        PROFILE_CONFIG_FILE,
        JSON.stringify(config),
      );

      // Update state
      setProfileImageUri(targetPath);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profileImageUri,
        updateProfilePicture,
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfilePicture = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfilePicture must be used within ProfileProvider");
  }
  return context;
};
