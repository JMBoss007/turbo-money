import { getIconForSubscription } from "@/lib/iconMatcher";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#f5a623",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#f5c542",
  Productivity: "#b8e8d0",
  Cloud: "#e8c4d0",
  Music: "#d4a5e8",
  Other: "#c4c4c4",
};

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (subscription: Subscription) => void;
}

const CreateSubscriptionModal: React.FC<CreateSubscriptionModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Other");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    const priceNum = parseFloat(price);
    if (!price.trim() || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const now = dayjs();
      const startDate = now.toISOString();
      const renewalDate =
        frequency === "Monthly"
          ? now.add(1, "month").toISOString()
          : now.add(1, "year").toISOString();

      // Get icon for the subscription
      const iconData = await getIconForSubscription(name);

      const subscription: Subscription = {
        id: `subscription-${Date.now()}`,
        name: name.trim(),
        price: parseFloat(price),
        currency: "USD",
        icon: iconData.source,
        billing: frequency,
        category: category,
        status: "active",
        startDate,
        renewalDate,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
        plan: category,
        paymentMethod: "Not provided",
      };

      onSubmit(subscription);
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Other");
    setErrors({});
  };

  const isValid =
    name.trim() && price && !isNaN(parseFloat(price)) && parseFloat(price) > 0;
  const isButtonDisabled = !isValid || isSubmitting;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1">
        <Pressable className="modal-overlay" onPress={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={onClose}>
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView className="modal-body">
              {/* Name Field */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.name && "auth-input-error",
                  )}
                  placeholder="Enter subscription name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                />
                {errors.name && (
                  <Text className="auth-error">{errors.name}</Text>
                )}
              </View>

              {/* Price Field */}
              <View className="auth-field">
                <Text className="auth-label">Price (USD)</Text>
                <TextInput
                  className={clsx(
                    "auth-input",
                    errors.price && "auth-input-error",
                  )}
                  placeholder="Enter price"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                />
                {errors.price && (
                  <Text className="auth-error">{errors.price}</Text>
                )}
              </View>

              {/* Frequency Field */}
              <View className="auth-field">
                <Text className="auth-label">Billing Frequency</Text>
                <View className="picker-row">
                  {["Monthly", "Yearly"].map((freq) => (
                    <Pressable
                      key={freq}
                      onPress={() => setFrequency(freq as "Monthly" | "Yearly")}
                      className={clsx(
                        "picker-option",
                        frequency === freq && "picker-option-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          frequency === freq && "picker-option-text-active",
                        )}
                      >
                        {freq}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Category Field */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setCategory(cat)}
                      className={clsx(
                        "category-chip",
                        category === cat && "category-chip-active",
                      )}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          category === cat && "category-chip-text-active",
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isButtonDisabled}
                className={clsx(
                  "auth-button",
                  isButtonDisabled && "auth-button-disabled",
                )}
              >
                <Text className="auth-button-text">
                  {isSubmitting ? "Adding..." : "Add Subscription"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
