import { ref } from 'vue'

export function useNotifications() {
  const permissionGranted = ref(false)
  
  /**
   * Request notification permission
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications')
      return false
    }
    
    if (Notification.permission === 'granted') {
      permissionGranted.value = true
      return true
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      permissionGranted.value = permission === 'granted'
      return permissionGranted.value
    }
    
    return false
  }
  
  /**
   * Show a notification
   */
  const showNotification = (title: string, options?: NotificationOptions): Notification | null => {
    if (!permissionGranted.value) {
      console.warn('Notification permission not granted')
      return null
    }
    
    try {
      return new Notification(title, options)
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }
  
  /**
   * Show a focus session completion notification
   */
  const showSessionCompleteNotification = (sessionTitle: string = 'Focus Session'): Notification | null => {
    return showNotification(`${sessionTitle} Completed!`, {
      body: 'How would you rate your focus during this session?',
      icon: '/logo.png',
      requireInteraction: true,
    })
  }
  
  /**
   * Initialize notifications
   */
  const initNotifications = async () => {
    await requestPermission()
  }
  
  return {
    permissionGranted,
    requestPermission,
    showNotification,
    showSessionCompleteNotification,
    initNotifications,
  }
}
