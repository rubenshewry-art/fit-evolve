import * as Notifications from 'expo-notifications'
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
    priority: Notifications.AndroidNotificationPriority
    color?: string
  }
> = {
  professional_tagged: {
    title: 'Você foi marcado!',
    sound: 'notification_tagged.wav',
    priority: Notifications.AndroidNotificationPriority.HIGH,
    color: '#0a7ea4',
  },
  badge_unlocked: {
    title: '🏆 Badge Conquistada!',
    sound: 'notification_badge.wav',
    priority: Notifications.AndroidNotificationPriority.HIGH,
    color: '#22C55E',
  },
  new_comment: {
    title: 'Novo comentário',
    sound: 'notification_comment.wav',
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
    color: '#0a7ea4',
  },
  new_message: {
    title: 'Nova mensagem',
    sound: 'notification_message.wav',
    priority: Notifications.AndroidNotificationPriority.HIGH,
    color: '#0a7ea4',
  },
  exam_analyzed: {
    title: 'Exame analisado',
    sound: 'notification_exam.wav',
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
    color: '#0a7ea4',
  },
  daily_tip: {
    title: 'Dica do dia',
    sound: 'notification_tip.wav',
    priority: Notifications.AndroidNotificationPriority.LOW,
    color: '#0a7ea4',
  },
  reminder: {
    title: 'Lembrete',
    sound: 'notification_reminder.wav',
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
    color: '#0a7ea4',
  },
}

/**
 * Inicializar notificações
 */
export async function initializeNotifications() {
  // Configurar comportamento padrão
  Notifications.setNotificationHandler({
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
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      console.warn('[Notifications] Permissão negada no iOS')
    }
  }

  // Android: criar canal de notificação
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
    })

    // Canais específicos por tipo
    await Notifications.setNotificationChannelAsync('high-priority', {
      name: 'Alta Prioridade',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22C55E',
    })

    await Notifications.setNotificationChannelAsync('messages', {
      name: 'Mensagens',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#0a7ea4',
    })
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
  const config = notificationConfig[type]

  try {
    await Notifications.scheduleNotificationAsync({
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
    console.error('[Notifications] Erro ao enviar notificação:', error)
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
  const config = notificationConfig[type]

  try {
    await Notifications.scheduleNotificationAsync({
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
    console.error('[Notifications] Erro ao agendar notificação:', error)
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
  const config = notificationConfig[type]

  try {
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
    await Notifications.scheduleNotificationAsync({
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
    console.error('[Notifications] Erro ao agendar notificação diária:', error)
  }
}

/**
 * Cancelar todas as notificações
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync()
    console.log('[Notifications] Todas as notificações canceladas')
  } catch (error) {
    console.error('[Notifications] Erro ao cancelar notificações:', error)
  }
}

/**
 * Hook para escutar notificações
 */
export function useNotificationListener(
  callback: (notification: Notifications.Notification) => void
) {
  // Listener para notificações recebidas enquanto app está aberto
  const subscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications] Notificação recebida:', notification)
    callback(notification)
  })

  // Listener para notificações clicadas
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
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
