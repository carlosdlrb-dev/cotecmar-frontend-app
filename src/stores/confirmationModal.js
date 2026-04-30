import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmationModal = defineStore('confirmationModal', () => {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')
  const onConfirm = ref(null)
  const onCancel = ref(null)
  const isLoading = ref(false)

  const show = ({ title: t, message: m, onConfirm: oc, onCancel: ca }) => {
    title.value = t
    message.value = m
    onConfirm.value = oc || null
    onCancel.value = ca || null
    isLoading.value = false
    isOpen.value = true
  }

  const confirm = async () => {
    if (!onConfirm.value) {
      isOpen.value = false
      return
    }
    isLoading.value = true
    try {
      await onConfirm.value()
    } finally {
      isLoading.value = false
      isOpen.value = false
    }
  }

  const cancel = () => {
    if (onCancel.value) onCancel.value()
    isOpen.value = false
  }

  return { isOpen, title, message, isLoading, show, confirm, cancel }
})
