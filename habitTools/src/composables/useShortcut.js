import { onMounted, onUnmounted } from 'vue'

export function useShortcut(handlers) {
  function onKeyDown(e) {
    const key = e.key.toLowerCase()
    const isMod = e.ctrlKey || e.metaKey

    if (isMod && key >= '1' && key <= '5') {
      e.preventDefault()
      handlers.onMenuChange?.(parseInt(key))
      return
    }
    if (isMod && key === 'n') {
      e.preventDefault()
      handlers.onFocusInput?.()
      return
    }
    if (isMod && key === 'r') {
      e.preventDefault()
      handlers.onSync?.()
      return
    }
    if (isMod && key === 'd') {
      e.preventDefault()
      handlers.onToggleTheme?.()
      return
    }
    if (key === 'escape') {
      handlers.onEsc?.()
      return
    }
  }

  onMounted(() => document.addEventListener('keydown', onKeyDown))
  onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
}
