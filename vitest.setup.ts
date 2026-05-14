import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  // Cleanup logic
})

// Mock Expo modules
vi.mock('expo-haptics', () => ({
  impactAsync: vi.fn().mockResolvedValue(undefined),
  notificationAsync: vi.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}))

vi.mock('expo-secure-store', () => ({
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  getItemAsync: vi.fn().mockResolvedValue(null),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('expo-file-system/legacy', () => ({
  writeAsStringAsync: vi.fn().mockResolvedValue(undefined),
  readAsStringAsync: vi.fn().mockResolvedValue(''),
  deleteAsync: vi.fn().mockResolvedValue(undefined),
  cacheDirectory: '/cache/',
  documentDirectory: '/documents/',
}))

vi.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: vi.fn().mockResolvedValue({
      granted: true,
    }),
    requestMicrophonePermissionsAsync: vi.fn().mockResolvedValue({
      granted: true,
    }),
  },
  CameraType: {
    back: 'back',
    front: 'front',
  },
}))

vi.mock('expo-image-picker', () => ({
  launchCameraAsync: vi.fn().mockResolvedValue({
    assets: [{ uri: 'file://mock-image.jpg' }],
    cancelled: false,
  }),
  launchImageLibraryAsync: vi.fn().mockResolvedValue({
    assets: [{ uri: 'file://mock-image.jpg' }],
    cancelled: false,
  }),
}))

vi.mock('expo-document-picker', () => ({
  getDocumentAsync: vi.fn().mockResolvedValue({
    assets: [{ uri: 'file://mock-document.pdf', name: 'exam.pdf' }],
    cancelled: false,
  }),
}))

vi.mock('expo-notifications', () => ({
  requestPermissionsAsync: vi.fn().mockResolvedValue({
    granted: true,
  }),
  scheduleNotificationAsync: vi.fn().mockResolvedValue('notification-id'),
}))

vi.mock('expo-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
  useLocalSearchParams: vi.fn(() => ({})),
  Stack: {
    Screen: ({ children }: any) => children,
  },
  Tabs: {
    Screen: ({ children }: any) => children,
  },
}))

vi.mock('expo-web-browser', () => ({
  openBrowserAsync: vi.fn().mockResolvedValue(undefined),
  dismissBrowser: vi.fn(),
}))

vi.mock('expo-linking', () => ({
  createURL: vi.fn((path) => `exp://localhost:8081${path}`),
  parseURL: vi.fn((url) => ({ hostname: 'localhost', path: '/' })),
}))

// Mock React Native modules
vi.mock('react-native', async () => {
  const actual = await vi.importActual('react-native')
  return {
    ...actual,
    Platform: {
      OS: 'ios',
      select: (obj: any) => obj.ios,
    },
    Dimensions: {
      get: vi.fn(() => ({
        width: 375,
        height: 667,
      })),
    },
  }
})

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    useUtils: vi.fn(() => ({
      invalidate: vi.fn(),
    })),
    auth: {
      login: {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
          mutateAsync: vi.fn(),
          isPending: false,
        })),
      },
    },
  },
}))

// Global test utilities
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
}
