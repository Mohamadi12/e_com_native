import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../global.css";
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'


const queryClient = new QueryClient();

export default function RootLayout() {
  return (
     <ClerkProvider tokenCache={tokenCache}>
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
    </ClerkProvider>
  );
}
