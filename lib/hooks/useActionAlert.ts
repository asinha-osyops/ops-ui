import { useState } from 'react'

export type AlertType = 'success' | 'error' | 'info' | 'destructive'

export interface AlertState {
  show: boolean
  type: AlertType
  title: string
  message: string
  details?: any
}

export function useActionAlert() {
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'info',
    title: '',
    message: '',
  })

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    details?: any
  ) => {
    setAlert({ show: true, type, title, message, details })
  }

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }))
  }

  const showSuccess = (title: string, message: string, details?: any) => {
    showAlert('success', title, message, details)
  }

  const showError = (title: string, message: string) => {
    showAlert('error', title, message)
  }

  const showDestructive = (title: string, message: string) => {
    showAlert('destructive', title, message)
  }

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showDestructive,
  }
}
