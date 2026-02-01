// Tạo một thanh  tab ở dưới -- ẩn đi các header, những tabs nhạy cảm sẽ bị chặn nếu chưa đăng nhập
import { useAuthStore } from "@/src/features/auth/store";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  const accessToken = useAuthStore((s) => s.accessToken);

  // Kiểm tra access token nếu sai thì prevent luôn
  const guardTab = (e: any) => {
    if (!accessToken) {
      e.preventDefault();
      return;
    }
  };

  return (
    <Tabs
      screenOptions={{ headerShown: false, lazy: true, freezeOnBlur: true }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="tables"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Tables",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="reviews"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Reviews",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="working-time"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Working",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="uploads"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Uploads",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cloud-upload-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="site-sections"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Sections",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="work-experience"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Work Exp",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="debug"
        listeners={{ tabPress: guardTab }}
        options={{
          title: "Debug",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
