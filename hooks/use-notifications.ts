import { useEffect } from 'react'
import {
  initializeNotifications,
  useNotificationListener,
  sendLocalNotification,
  scheduleDailyNotification,
  type NotificationType,
} from '@/lib/notifications'

/**
 * Hook para inicializar e gerenciar notificações
 */
export function useNotifications() {
  useEffect(() => {
    // Inicializar notificações
    initializeNotifications()

    // Agendar dica do dia para as 8:00 AM
    scheduleDailyNotification(
      'daily_tip',
      'Dica do dia: Mantenha a consistência! Capture fotos regularmente.',
      8,
      0
    )

    // Agendar lembrete para as 6:00 PM
    scheduleDailyNotification(
      'reminder',
      'Lembrete: Capture sua foto de evolução hoje',
      18,
      0
    )

    console.log('[useNotifications] Notificações inicializadas')
  }, [])

  // Escutar notificações
  useEffect(() => {
    const unsubscribe = useNotificationListener((notification) => {
      console.log('[useNotifications] Notificação recebida:', notification)
    })

    return unsubscribe
  }, [])

  return {
    sendNotification: sendLocalNotification,
  }
}

/**
 * Funções auxiliares para disparar notificações de eventos específicos
 */
export const notificationEvents = {
  /**
   * Quando um profissional marca o aluno em um post
   */
  professionalTagged: (professionalName: string) => {
    sendLocalNotification(
      'professional_tagged',
      `${professionalName} te marcou em um post!`,
      { professionalName }
    )
  },

  /**
   * Quando o aluno conquista um badge
   */
  badgeUnlocked: (badgeName: string) => {
    sendLocalNotification(
      'badge_unlocked',
      `Você conquistou a badge "${badgeName}"!`,
      { badgeName }
    )
  },

  /**
   * Quando há um novo comentário em um post
   */
  newComment: (userName: string, postId: string) => {
    sendLocalNotification(
      'new_comment',
      `${userName} comentou em seu post`,
      { userName, postId }
    )
  },

  /**
   * Quando há uma nova mensagem
   */
  newMessage: (senderName: string) => {
    sendLocalNotification(
      'new_message',
      `Mensagem de ${senderName}`,
      { senderName }
    )
  },

  /**
   * Quando um exame é analisado
   */
  examAnalyzed: () => {
    sendLocalNotification(
      'exam_analyzed',
      'Seus exames foram analisados com sucesso!',
      {}
    )
  },

  /**
   * Dica do dia personalizada
   */
  dailyTip: (tip: string) => {
    sendLocalNotification(
      'daily_tip',
      tip,
      {}
    )
  },
}
