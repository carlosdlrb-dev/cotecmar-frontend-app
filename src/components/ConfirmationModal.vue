<script setup>
import { useConfirmationModal } from '../stores/confirmationModal'

const modal = useConfirmationModal()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modal.isOpen" class="modal-backdrop" @click.self="modal.cancel()">
        <div class="modal max-w-[420px]">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-[16px] font-black text-slate-900">{{ modal.title }}</h2>
              <p class="text-sm text-slate-600 mt-1">{{ modal.message }}</p>
            </div>
          </div>

          <div class="modal-actions">
            <button 
              class="ghost-button" 
              :disabled="modal.isLoading"
              @click="modal.cancel()"
            >
              Cancelar
            </button>
            <button 
              class="danger-button" 
              :disabled="modal.isLoading"
              @click="modal.confirm()"
            >
              <span v-if="modal.isLoading" class="spinner relative z-10 mr-2"></span>
              {{ modal.isLoading ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
