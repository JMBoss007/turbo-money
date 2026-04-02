import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/lib/SubscriptionContext";
import { styled } from "nativewind";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
const StyledTextInput = styled(TextInput);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);

const Subscriptions = () => {
  const { subscriptions } = useSubscriptions();
  const [searchText, setSearchText] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const lastScrollY = useRef(0);

  const filteredSubscriptions = useMemo(() => {
    if (!searchText.trim()) {
      return subscriptions;
    }

    const searchLower = searchText.toLowerCase();
    return subscriptions.filter(
      (subscription) =>
        subscription.name.toLowerCase().includes(searchLower) ||
        subscription.category?.toLowerCase().includes(searchLower) ||
        subscription.plan?.toLowerCase().includes(searchLower),
    );
  }, [searchText, subscriptions]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      // Dismiss keyboard when scrolling down
      if (currentScrollY > lastScrollY.current) {
        Keyboard.dismiss();
      }
      lastScrollY.current = currentScrollY;
    },
    [],
  );

  const headerComponent = useMemo(
    () => (
      <>
        <ListHeading title="Subscriptions" showViewAll={false} />

        <View className="mb-4 flex-row items-center rounded-lg bg-card px-3 py-2">
          <StyledTextInput
            className="ml-3 flex-1 text-foreground"
            placeholder="Search subscriptions..."
            placeholderTextColor="#666"
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View>
      </>
    ),
    [searchText, handleSearchChange],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StyledKeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ListHeaderComponent={headerComponent}
          data={filteredSubscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() =>
                setExpandedSubscriptionId((currentId) =>
                  currentId === item.id ? null : item.id,
                )
              }
            />
          )}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="home-empty-state">
              {searchText.trim()
                ? "No subscriptions found"
                : "No subscriptions yet!"}
            </Text>
          }
          contentContainerClassName="pb-30 p-5"
          scrollEnabled={true}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          scrollIndicatorInsets={{ right: 1 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </StyledKeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Subscriptions;
