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
 * Nota: Notificações push remotas foram removidas do Expo Go no SDK 53+
 * Use um development build para testar notificações completas
 */
export function useNotifications() {
  useEffect(() => {
    // Inicializar notificações (apenas local)
    try {
      initializeNotifications()
      console.log('[useNotifications] Notificações inicializadas (modo local)')
      
      // Nota: Agendamento de notificações diárias desabilitado no Expo Go
      // Funciona apenas em development build
      // Para testar, gere um development build com: eas build --platform android --profile preview
    } catch (error) {
      // Ignorar erro se estiver no Expo Go
      console.warn('[useNotifications] Notificações não disponíveis no Expo Go')
    }
  }, [])

  useEffect(() => {
    // Escutar notificações (apenas em development build)
    let unsubscribe: (() => void) | null = null
    
    const setupListener = async () => {
      try {
        const setupFn = useNotificationListener((notification) => {
          console.log('[useNotifications] Notificação recebida:', notification)
        })
        unsubscribe = await setupFn()
      } catch (error) {
        // Ignorar erro se estiver no Expo Go
        console.warn('[useNotifications] Erro ao configurar listener:', error)
      }
    }
    
    setupListener()
    
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return {
    sendNotification: (type: NotificationType, body: string, data?: Record<string, any>) => {
      try {
        return sendLocalNotification(type, body, data)
      } catch (error) {
        console.warn('[useNotifications] Erro ao enviar notificação:', error)
      }
    },
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
