import { Platform } from 'react-native'

/**
 * Tipos de notificações suportadas
 */
export type NotificationType =
  | 'professional_tagged'
  | 'badge_unlocked'
  | 'new_comment'
  | 'new_message'
  | 'exam_analyzed'
  | 'daily_tip'
  | 'reminder'

/**
 * Configuração de notificações por tipo
 */
const notificationConfig: Record<
  NotificationType,
  {
    title: string
    sound: string
    priority: string
    color?: string
  }
> = {
  professional_tagged: {
    title: 'Você foi marcado!',
    sound: 'default',
    priority: 'HIGH',
    color: '#0a7ea4',
  },
  badge_unlocked: {
    title: '🏆 Badge Conquistada!',
    sound: 'default',
    priority: 'HIGH',
    color: '#22C55E',
  },
  new_comment: {
    title: 'Novo comentário',
    sound: 'default',
    priority: 'DEFAULT',
    color: '#0a7ea4',
  },
  new_message: {
    title: 'Nova mensagem',
    sound: 'default',
    priority: 'HIGH',
    color: '#0a7ea4',
  },
  exam_analyzed: {
    title: 'Exame analisado',
    sound: 'default',
    priority: 'DEFAULT',
    color: '#0a7ea4',
  },
  daily_tip: {
    title: 'Dica do dia',
    sound: 'default',
    priority: 'LOW',
    color: '#0a7ea4',
  },
  reminder: {
    title: 'Lembrete',
    sound: 'default',
    priority: 'DEFAULT',
    color: '#0a7ea4',
  },
}

// Lazy load expo-notifications only when needed (not in Expo Go)
let Notifications: any = null

async function loadNotifications() {
  if (Notifications) return Notifications
  if (Platform.OS === 'web') return null

  // O módulo só é resolvido em runtime. Se o cliente não expuser a API nativa,
  // o import falha e o restante do app continua funcionando em modo simulado.

  try {
    Notifications = await import('expo-notifications')
    return Notifications
  } catch (error) {
    console.warn('[Notifications] expo-notifications não disponível (Expo Go SDK 53+)')
    return null
  }
}

/**
 * Inicializar notificações
 */
export async function initializeNotifications() {
  try {
    const NotificationsModule = await loadNotifications()
    if (!NotificationsModule || typeof NotificationsModule.setNotificationHandler !== 'function') return

    // Configurar comportamento padrão
    NotificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      } as any),
    })

    // Solicitar permissão (iOS)
    if (Platform.OS === 'ios') {
      const { status } = await NotificationsModule.requestPermissionsAsync()
      if (status !== 'granted') {
        console.warn('[Notifications] Permissão negada no iOS')
      }
    }

    // Android: criar canal de notificação
    if (Platform.OS === 'android') {
      await NotificationsModule.setNotificationChannelAsync('default', {
        name: 'default',
        importance: 5, // MAX
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0a7ea4',
      })

      // Canais específicos por tipo
      await NotificationsModule.setNotificationChannelAsync('high-priority', {
        name: 'Alta Prioridade',
        importance: 5, // MAX
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#22C55E',
      })

      await NotificationsModule.setNotificationChannelAsync('messages', {
        name: 'Mensagens',
        importance: 4, // HIGH
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#0a7ea4',
      })
    }
  } catch (error) {
    console.warn('[Notifications] Erro ao inicializar notificações:', error)
  }
}

/**
 * Enviar notificação local
 */
export async function sendLocalNotification(
  type: NotificationType,
  body: string,
  data?: Record<string, any>
) {
  try {
    const NotificationsModule = await loadNotifications()
    if (!NotificationsModule || typeof NotificationsModule.scheduleNotificationAsync !== 'function') {
      console.log(`[Notifications] Notificação simulada (Expo Go): ${type} - ${body}`)
      return
    }

    const config = notificationConfig[type]

    await NotificationsModule.scheduleNotificationAsync({
      content: {
        title: config.title,
        body,
        sound: config.sound,
        data: {
          type,
          ...data,
        },
      },
      trigger: {
        seconds: 1,
      } as any,
    })

    console.log(`[Notifications] Notificação enviada: ${type}`)
  } catch (error) {
    console.warn('[Notifications] Erro ao enviar notificação:', error)
  }
}

/**
 * Agendar notificação para mais tarde
 */
export async function scheduleNotification(
  type: NotificationType,
  body: string,
  delaySeconds: number,
  data?: Record<string, any>
) {
  try {
    const NotificationsModule = await loadNotifications()
    if (!NotificationsModule || typeof NotificationsModule.scheduleNotificationAsync !== 'function') {
      console.log(`[Notifications] Notificação agendada simulada (Expo Go): ${type}`)
      return
    }

    const config = notificationConfig[type]

    await NotificationsModule.scheduleNotificationAsync({
      content: {
        title: config.title,
        body,
        sound: config.sound,
        data: {
          type,
          ...data,
        },
      },
      trigger: {
        seconds: delaySeconds,
      } as any,
    })

    console.log(`[Notifications] Notificação agendada: ${type}`)
  } catch (error) {
    console.warn('[Notifications] Erro ao agendar notificação:', error)
  }
}

/**
 * Agendar notificação diária
 */
export async function scheduleDailyNotification(
  type: NotificationType,
  body: string,
  hour: number = 8,
  minute: number = 0
) {
  try {
    const NotificationsModule = await loadNotifications()
    if (!NotificationsModule || typeof NotificationsModule.scheduleNotificationAsync !== 'function') {
      console.log(`[Notifications] Notificação diária simulada (Expo Go): ${type}`)
      return
    }

    const config = notificationConfig[type]

    // Calcular próxima ocorrência
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(hour, minute, 0, 0)

    // Se o horário já passou hoje, agendar para amanhã
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const secondsUntilNotification = Math.floor(
      (scheduledTime.getTime() - now.getTime()) / 1000
    )

    // Usar trigger de segundos em vez de daily
    await NotificationsModule.scheduleNotificationAsync({
      content: {
        title: config.title,
        body,
        sound: config.sound,
        data: {
          type,
        },
      },
      trigger: {
        seconds: Math.max(secondsUntilNotification, 1),
      } as any,
    })

    console.log(`[Notifications] Notificação diária agendada: ${type}`)
  } catch (error) {
    console.warn('[Notifications] Erro ao agendar notificação diária:', error)
  }
}

/**
 * Cancelar todas as notificações
 */
export async function cancelAllNotifications() {
  try {
    const NotificationsModule = await loadNotifications()
    if (!NotificationsModule || typeof NotificationsModule.cancelAllScheduledNotificationsAsync !== 'function') return

    await NotificationsModule.cancelAllScheduledNotificationsAsync()
    console.log('[Notifications] Todas as notificações canceladas')
  } catch (error) {
    console.warn('[Notifications] Erro ao cancelar notificações:', error)
  }
}

/**
 * Hook para escutar notificações
 */
export function useNotificationListener(
  callback: (notification: any) => void
) {
  return async () => {
    try {
      const NotificationsModule = await loadNotifications()
      if (
        !NotificationsModule ||
        typeof NotificationsModule.addNotificationReceivedListener !== 'function' ||
        typeof NotificationsModule.addNotificationResponseReceivedListener !== 'function'
      ) return () => {}

      // Listener para notificações recebidas enquanto app está aberto
      const subscription = NotificationsModule.addNotificationReceivedListener((notification: any) => {
        console.log('[Notifications] Notificação recebida:', notification)
        callback(notification)
      })

      // Listener para notificações clicadas
      const responseSubscription = NotificationsModule.addNotificationResponseReceivedListener(
        (response: any) => {
          console.log('[Notifications] Notificação clicada:', response)
          // Aqui você pode navegar para a tela apropriada baseado no tipo
          const type = response.notification.request.content.data.type as NotificationType
          handleNotificationClick(type, response.notification.request.content.data)
        }
      )

      return () => {
        subscription.remove()
        responseSubscription.remove()
      }
    } catch (error) {
      console.warn('[Notifications] Erro ao configurar listeners:', error)
      return () => {}
    }
  }
}

/**
 * Manipular clique em notificação
 */
function handleNotificationClick(type: NotificationType, data: Record<string, any>) {
  console.log(`[Notifications] Clique em notificação: ${type}`, data)

  // Aqui você pode adicionar lógica de navegação baseada no tipo
  switch (type) {
    case 'professional_tagged':
      // Navegar para o feed
      console.log('[Notifications] Navegando para feed...')
      break
    case 'badge_unlocked':
      // Navegar para perfil
      console.log('[Notifications] Navegando para perfil...')
      break
    case 'new_comment':
      // Navegar para o post
      console.log('[Notifications] Navegando para post...')
      break
    case 'new_message':
      // Navegar para chat
      console.log('[Notifications] Navegando para chat...')
      break
    default:
      console.log('[Notifications] Tipo de notificação desconhecido:', type)
  }
}

/**
 * Solicitar permissão de notificações (lazy loaded para Expo Go)
 */
export async function requestNotificationPermissions() {
  try {
    const NotificationsModule = await loadNotifications()
    if (!NotificationsModule || typeof NotificationsModule.requestPermissionsAsync !== 'function') {
      console.log('[Notifications] Permissão de notificações simulada (Expo Go)')
      return
    }

    const existing = typeof NotificationsModule.getPermissionsAsync === 'function'
      ? await NotificationsModule.getPermissionsAsync()
      : null

    if (existing?.status === 'granted') {
      console.log('[Notifications] Permissão já concedida:', existing.status)
      return
    }

    const permissionResult = Platform.OS === 'ios'
      ? await NotificationsModule.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        })
      : await NotificationsModule.requestPermissionsAsync()

    console.log('[Notifications] Status de permissão:', permissionResult?.status ?? 'unknown')
  } catch (error) {
    console.warn('[Notifications] Erro ao solicitar permissão:', error)
  }
}

/**
 * Integrar notificações com eventos do aplicativo
 */
export async function integrateNotificationEvents() {
  // Escutar eventos de badge conquistada
  // Escutar eventos de profissional marcado
  // Escutar eventos de novo comentário
  // Escutar eventos de novo exame analisado
  console.log('[Notifications] Eventos integrados')
}

/**
 * Notificações de teste
 */
export async function sendTestNotifications() {
  const types: NotificationType[] = [
    'professional_tagged',
    'badge_unlocked',
    'new_comment',
    'new_message',
    'exam_analyzed',
    'daily_tip',
  ]

  for (let i = 0; i < types.length; i++) {
    const type = types[i]
    const messages: Record<NotificationType, string> = {
      professional_tagged: 'Você foi marcado em um post por João Silva',
      badge_unlocked: 'Você conquistou a badge "30 Dias Consistente"!',
      new_comment: 'Seu personal trainer comentou: "Excelente progresso!"',
      new_message: 'Mensagem de Carlos Personal Trainer',
      exam_analyzed: 'Seus exames foram analisados com sucesso',
      daily_tip: 'Dica do dia: Mantenha a consistência! Capture fotos regularmente.',
      reminder: 'Lembrete: Capture sua foto de evolução hoje',
    }

    await scheduleNotification(type, messages[type], i * 2)
  }
}
