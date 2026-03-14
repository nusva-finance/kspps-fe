import { useState } from 'react'

type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface ModalState {
  isOpen: boolean
  type: ModalType
  title: string
  message: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
  }>
}

export const useModal = () => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    actions: undefined
  })

  const showModal = (type: ModalType, title: string, message: string, actions?: ModalState['actions']) => {
    setModal({ isOpen: true, type, title, message, actions })
  }

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }))

  const showSuccess = (title: string, message: string) => {
    showModal('success', title, message)
  }

  const showError = (title: string, message: string) => {
    showModal('error', title, message)
  }

  const showWarning = (title: string, message: string) => {
    showModal('warning', title, message)
  }

  const showInfo = (title: string, message: string) => {
    showModal('info', title, message)
  }

  const showConfirm = (title: string, message: string, actions: ModalState['actions']) => {
    showModal('confirm', title, message, actions)
  }

  return {
    modal,
    showModal,
    closeModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  }
}
