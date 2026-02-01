// Đầu tiên khi mở web thì sẽ vào trang home

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
