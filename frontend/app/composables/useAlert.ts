type AlertStatus = 'info' | 'warning' | 'error' | 'success'

type AlertItem = {
  key: string
  title: string
  description?: string
  status: AlertStatus
  persistent?: boolean
}

export const useAlert = () => {
  const alerts = useState<AlertItem[]>('alerts', () => [])

  const addAlert = (
    key: string,
    options: {
      title: string
      description?: string
      status: AlertStatus
      persistent?: boolean
    }
  ) => {
    const index = alerts.value.findIndex(alert => alert.key === key)

    if (index >= 0) {
      alerts.value[index] = {
        key,
        title: options.title,
        description: options.description,
        status: options.status,
        persistent: options.persistent ?? false,
      }
      return
    }

    alerts.value.push({
      key,
      title: options.title,
      description: options.description,
      status: options.status,
      persistent: options.persistent ?? false,
    })
  }

  const removeAlert = (key: string) => {
    alerts.value = alerts.value.filter(alert => alert.key !== key)
  }

  const clearNonPersistentAlerts = () => {
    alerts.value = alerts.value.filter(alert => !alert.persistent)
  }

  const clearAllAlerts = () => {
    alerts.value = []
  }

  const getAlert = (key: string) => {
    return alerts.value.find(alert => alert.key === key)
  }

  return {
    alerts,
    addAlert,
    removeAlert,
    clearNonPersistentAlerts,
    clearAllAlerts,
    getAlert,
  }
}
