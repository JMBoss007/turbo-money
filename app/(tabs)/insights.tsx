import { useRouter } from "expo-router";
import { useSubscriptions } from "@/lib/SubscriptionContext";
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import dayjs from "dayjs";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

// Bar chart data for demonstration
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"];
const CHART_VALUES = [35, 28, 20, 40, 32, 18, 22];
const MAX_CHART_VALUE = 45;

// Pastel color palette for history cards
const getPastelBackground = (colorHex?: string): string => {
  if (!colorHex) return "#f5f5f5";

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  };

  const rgb = hexToRgb(colorHex);
  if (!rgb) return "#f5f5f5";

  // Create pastel by blending with white
  const pastelR = Math.round((rgb.r + 255) / 2);
  const pastelG = Math.round((rgb.g + 255) / 2);
  const pastelB = Math.round((rgb.b + 255) / 2);

  return `rgb(${pastelR}, ${pastelG}, ${pastelB})`;
};

const Insights = () => {
  const router = useRouter();
  const { subscriptions } = useSubscriptions();
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const getCurrentDayIndex = () => {
    const today = dayjs();
    const dayOfWeek = today.day(); // 0 = Sunday
    // Convert to match our DAYS_OF_WEEK array (0 = Monday)
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  };

  // Calculate total monthly expense from ALL subscriptions
  const monthlyTotal = useMemo(() => {
    return subscriptions.reduce((sum, sub) => {
      if (sub.billing === "Monthly") {
        return sum + (sub.price || 0);
      } else if (sub.billing === "Yearly") {
        return sum + (sub.price || 0) / 12;
      }
      return sum;
    }, 0);
  }, [subscriptions]);

  // Sort subscriptions by renewal date for history
  const sortedByRenewal = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const dateA = new Date(a.renewalDate || 0);
      const dateB = new Date(b.renewalDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [subscriptions]);

  // Track highlights: last 5 subscriptions by renewal date
  const recentSubscriptions = useMemo(() => {
    return sortedByRenewal.slice(0, 5);
  }, [sortedByRenewal]);

  const currentMonth = dayjs().format("MMMM YYYY");
  const currentDayIndex = getCurrentDayIndex();

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerClassName="pb-40"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-5">
          <Pressable
            onPress={handleBack}
            className="size-11 items-center justify-center rounded-full border border-black/15 bg-muted"
          >
            <Text className="text-xl font-sans-bold text-primary">‹</Text>
          </Pressable>
          <Text className="flex-1 text-center text-2xl font-sans-bold text-primary">
            Monthly Insights
          </Text>
          <View className="size-11" />
        </View>

        {/* Upcoming Section */}
        <View className="px-5 pt-2">
          <View className="mb-5">
            <Text className="text-xl font-sans-bold text-primary">
              Upcoming
            </Text>
          </View>

          {/* Weekly Bar Chart - Dynamic Highlighting Based on Current Day */}
          <View className="mb-6 rounded-3xl bg-muted p-6">
            {/* Chart container with fixed height */}
            <View style={{ height: 240 }} className="flex-row gap-4">
              {/* Y-axis labels */}
              <View className="justify-between pt-1">
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  45
                </Text>
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  30
                </Text>
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  15
                </Text>
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  0
                </Text>
              </View>

              {/* Chart content - clean and open */}
              <View className="relative flex-1">
                {/* Subtle horizontal guide lines */}
                <View className="absolute left-0 right-0 top-0 h-px bg-border/30" />
                <View
                  className="absolute left-0 right-0 h-px border-t border-dashed border-border/25"
                  style={{ top: "33.33%" }}
                />
                <View
                  className="absolute left-0 right-0 h-px border-t border-dashed border-border/25"
                  style={{ top: "66.66%" }}
                />
                <View className="absolute left-0 right-0 bottom-0 h-px bg-border/30" />

                {/* Bars container */}
                <View className="flex-1 flex-row items-end justify-between px-1 pb-8">
                  {DAYS_OF_WEEK.map((day, index) => {
                    const value = CHART_VALUES[index];
                    const isHighlighted = index === currentDayIndex;
                    const heightPercent = (value / MAX_CHART_VALUE) * 100;

                    return (
                      <View key={day} className="flex-1 items-center">
                        {/* Bubble label for highlighted bar - bigger and better positioned */}
                        {isHighlighted && (
                          <View className="absolute -top-10 rounded-full bg-accent px-3 py-1.5">
                            <Text className="text-sm font-sans-bold text-white">
                              ${value}
                            </Text>
                          </View>
                        )}

                        {/* Bar - thicker and fully rounded */}
                        <View
                          style={{
                            height: `${heightPercent}%`,
                            width: 32,
                            borderRadius: 50,
                          }}
                          className={isHighlighted ? "bg-accent" : "bg-primary"}
                        />

                        {/* Day label */}
                        <Text className="mt-2 text-xs font-sans-semibold text-primary">
                          {day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Expenses Summary Card - Real Total from All Subscriptions */}
        <View className="mx-5 mb-6 rounded-3xl border border-black/10 bg-card p-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                Expenses
              </Text>
              <Text className="mt-2 text-base font-sans-semibold text-primary">
                {currentMonth}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-sans-bold text-primary">
                {formatCurrency(monthlyTotal)}
              </Text>
              <View className="mt-2">
                <Text className="text-xs font-sans-semibold text-accent">
                  +12%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* History Section */}
        <View className="px-5">
          <View className="list-head">
            <Text className="list-title">
              History
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/subscriptions")}
              className="list-action"
            >
              <Text className="list-action-text">
                View all
              </Text>
            </Pressable>
          </View>

          {/* History Cards List - Clickable with Expand/Collapse */}
          <View className="gap-3 mt-5">
            {recentSubscriptions.map((item) => (
              <View key={item.id}>
                <Pressable
                  onPress={() =>
                    setExpandedCardId((current) =>
                      current === item.id ? null : item.id,
                    )
                  }
                  className="flex-row items-center gap-4 rounded-3xl p-4 border border-black/8"
                  style={{
                    backgroundColor: getPastelBackground(item.color),
                  }}
                >
                  {/* Icon */}
                  {item.icon && (
                    <Image
                      source={item.icon}
                      className="size-16 rounded-lg flex-shrink-0"
                    />
                  )}

                  {/* Content - Title and Date */}
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-base font-sans-bold text-primary"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text className="mt-1.5 text-xs font-sans-medium text-muted-foreground">
                      {item.renewalDate
                        ? dayjs(item.renewalDate).format("MMM DD, HH:mm")
                        : "Date not set"}
                    </Text>
                  </View>

                  {/* Right - Price and Billing */}
                  <View className="items-end gap-1 flex-shrink-0">
                    <Text className="text-base font-sans-bold text-primary">
                      {formatCurrency(item.price, item.currency)}
                    </Text>
                    <Text className="text-xs font-sans-medium text-muted-foreground">
                      {item.billing === "Monthly"
                        ? "per month"
                        : item.billing === "Yearly"
                          ? "per year"
                          : item.billing}
                    </Text>
                  </View>
                </Pressable>

                {/* Expanded Details */}
                {expandedCardId === item.id && (
                  <View
                    className="mt-2 rounded-3xl border border-black/8 bg-subscription p-4"
                    style={{ backgroundColor: getPastelBackground(item.color) }}
                  >
                    <View className="gap-3">
                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground flex-1">
                          Payment:
                        </Text>
                        <Text className="text-sm font-sans-bold text-primary flex-1 text-right">
                          {item.paymentMethod?.trim() ?? "Not provided"}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground flex-1">
                          Category:
                        </Text>
                        <Text className="text-sm font-sans-bold text-primary flex-1 text-right">
                          {(item.category?.trim() || item.plan?.trim()) ??
                            "Not provided"}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground flex-1">
                          Started:
                        </Text>
                        <Text className="text-sm font-sans-bold text-primary flex-1 text-right">
                          {item.startDate
                            ? formatSubscriptionDateTime(item.startDate)
                            : "Not provided"}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground flex-1">
                          Renewal:
                        </Text>
                        <Text className="text-sm font-sans-bold text-primary flex-1 text-right">
                          {item.renewalDate
                            ? formatSubscriptionDateTime(item.renewalDate)
                            : "Not provided"}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between gap-2">
                        <Text className="text-sm font-sans-medium text-muted-foreground flex-1">
                          Status:
                        </Text>
                        <Text className="text-sm font-sans-bold text-primary flex-1 text-right">
                          {item.status
                            ? formatStatusLabel(item.status)
                            : "Not provided"}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
