import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ListHeading = ({ title, showViewAll = true }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {showViewAll && (
        <TouchableOpacity className="list-action">
          <Text className="list-action-text">View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ListHeading;
