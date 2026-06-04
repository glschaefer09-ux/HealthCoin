import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#0f2027", borderTopColor: "#1e3a4a" },
        tabBarActiveTintColor: "#00d4ff",
        tabBarInactiveTintColor: "#64748b",
        headerStyle: { backgroundColor: "#0f2027" },
        headerTintColor: "#e2e8f0",
        headerTitleStyle: { fontWeight: "800" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Health Space", tabBarLabel: "Community", tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ title: "HLTH Wallet", tabBarLabel: "Wallet", tabBarIcon: ({ color }) => <TabIcon emoji="💳" color={color} /> }}
      />
      <Tabs.Screen
        name="pos"
        options={{ title: "Provider Terminal", tabBarLabel: "Terminal", tabBarIcon: ({ color }) => <TabIcon emoji="🏥" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20, opacity: color === "#00d4ff" ? 1 : 0.5 }}>{emoji}</Text>;
}
