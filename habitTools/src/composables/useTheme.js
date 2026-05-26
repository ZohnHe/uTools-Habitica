import { ref, computed } from 'vue'
import { getFromDB, saveToDB } from '../utils/db.js'

const THEME_PREF_KEY = 'THEME_PREF'

function getInitialTheme() {
  const saved = getFromDB(THEME_PREF_KEY)
  if (saved !== null) return saved === 'dark'
  if (typeof utools !== 'undefined' && utools.isDarkColors) {
    return utools.isDarkColors()
  }
  return false
}

const isDark = ref(getInitialTheme())

function applyTheme() {
  const html = document.documentElement
  if (isDark.value) {
    html.setAttribute('data-theme', 'dark')
    html.classList.add('dark')
  } else {
    html.setAttribute('data-theme', 'light')
    html.classList.remove('dark')
  }
}

applyTheme()

export function useTheme() {
  const isDarkMode = computed(() => isDark.value)

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
    saveToDB(THEME_PREF_KEY, isDark.value ? 'dark' : 'light')
  }

  return { isDarkMode, toggleTheme }
}
