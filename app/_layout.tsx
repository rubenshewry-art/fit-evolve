import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { TransitionView } from "@/components/transition-view";
import { LoadingIndicator } from "@/components/loading-indicator";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  anchor: "(tabs)",
};

// Child component that uses tRPC (inside provider)
function RootLayoutContent() {
  const { isAuthenticated, loading } = useAuth();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);

  // Query to check onboarding status (now inside provider)
  const { data: onboardingStatus } = trpc.profile.checkOnboardingStatus.useQuery(
    undefined,
    {
      enabled: isAuthenticated && !loading,
      retry: 1,
    }
  );

  // Update onboarding state when status is fetched
  useEffect(() => {
    if (onboardingStatus?.completed !== undefined) {
      setOnboardingCompleted(onboardingStatus.completed);
    }
  }, [onboardingStatus]);

  // Determine current route for transition animation
  const currentRoute = useMemo(() => {
    if (!isAuthenticated && !loading) {
      return 'login';
    } else if (isAuthenticated && !loading) {
      if (onboardingCompleted === null) {
        return 'loading';
      } else if (onboardingCompleted) {
        return '(tabs)';
      } else {
        return 'onboarding';
      }
    }
    return 'loading';
  }, [isAuthenticated, loading, onboardingCompleted]);

  // Update previous route for transition animation
  useEffect(() => {
    if (currentRoute !== 'loading' && previousRoute !== currentRoute) {
      setPreviousRoute(currentRoute);
    }
  }, [currentRoute, previousRoute]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Loading indicator overlay during onboarding status check */}
      {isAuthenticated && !loading && onboardingCompleted === null && (
        <TransitionView
          transitionType="fade"
          duration={300}
          visible={true}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
        >
          <View style={{ flex: 1, backgroundColor: 'white' }}>
            <LoadingIndicator
              size={60}
              text="Preparando app..."
              visible={true}
            />
          </View>
        </TransitionView>
      )}

      {/* Main stack with transitions */}
      <TransitionView
        transitionType="fade"
        duration={400}
        visible={!(isAuthenticated && !loading && onboardingCompleted === null)}
      >
        <Stack screenOptions={{ headerShown: false }}>
          {isAuthenticated && !loading ? (
            onboardingCompleted === null ? (
              // Loading onboarding status - show nothing (will redirect when ready)
              <Stack.Screen name="login" options={{ headerShown: false }} />
            ) : onboardingCompleted ? (
              // Onboarding completed - show main app
              <>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="camera" options={{ presentation: "modal" }} />
                <Stack.Screen name="photo-vault" options={{ presentation: "modal" }} />
                <Stack.Screen name="exam-upload" options={{ presentation: "modal" }} />
                <Stack.Screen name="privacy-panel" options={{ presentation: "modal" }} />
                <Stack.Screen name="feed" options={{ presentation: "modal" }} />
              </>
            ) : (
              // Onboarding not completed - show onboarding
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            )
          ) : (
            <Stack.Screen name="login" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="oauth/callback" />
        </Stack>
      </TransitionView>

      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  useNotifications();
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
    console.log('[RootLayout] Notificações inicializadas');
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RootLayoutContent />
      </QueryClientProvider>
    </trpc.Provider>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
