import { ref } from 'vue'

const STORAGE_KEY = 'leaf-theme'
const isDark = ref(false)

const applyTheme = (dark) => {
  isDark.value = dark

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
  }
}

const initTheme = () => {
  if (typeof window === 'undefined') return

  const savedTheme = localStorage.getItem(STORAGE_KEY)
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  applyTheme(savedTheme ? savedTheme === 'dark' : Boolean(prefersDark))
}

const toggleTheme = () => {
  applyTheme(!isDark.value)
}

export function useTheme() {
  return {
    isDark,
    initTheme,
    toggleTheme,
    setTheme: applyTheme
  }
}
