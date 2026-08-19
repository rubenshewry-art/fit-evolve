import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
}))

describe('notifications fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não lança erro ao solicitar permissão no Expo Go', async () => {
    const { requestNotificationPermissions } = await import('@/lib/notifications')

    await expect(requestNotificationPermissions()).resolves.toBeUndefined()
  })

  it('não lança erro ao enviar notificação local no Expo Go', async () => {
    const { sendLocalNotification } = await import('@/lib/notifications')

    await expect(
      sendLocalNotification('daily_tip', 'Mantenha a consistência!'),
    ).resolves.toBeUndefined()
  })

  it('não lança erro ao inicializar notificações no Expo Go', async () => {
    const { initializeNotifications } = await import('@/lib/notifications')

    await expect(initializeNotifications()).resolves.toBeUndefined()
  })
})
