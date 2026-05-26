<template>
  <div class="status-toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="item in items"
        :key="item.id"
        class="status-toast-item"
        :class="item.className"
      >
        {{ item.text }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([])
let idCounter = 0

function show(changes) {
  const entries = Object.entries(changes)
  for (const [key, value] of entries) {
    const id = ++idCounter
    let text = ''
    let className = ''
    switch (key) {
      case 'hp':
        text = `${value >= 0 ? '+' : ''}${Math.floor(value)} HP`
        className = value >= 0 ? 'toast-hp-up' : 'toast-hp-down'
        break
      case 'exp':
        text = `${value >= 0 ? '+' : ''}${Math.floor(value)} EXP`
        className = 'toast-exp'
        break
      case 'mp':
        text = `${value >= 0 ? '+' : ''}${Math.floor(value)} MP`
        className = 'toast-mp'
        break
      case 'gp':
        text = `${value >= 0 ? '+' : ''}${Math.floor(value)} GP`
        className = value >= 0 ? 'toast-gp-up' : 'toast-gp-down'
        break
      default:
        text = `${value >= 0 ? '+' : ''}${value} ${key.toUpperCase()}`
        className = 'toast-default'
    }
    items.value.push({ id, text, className })
    setTimeout(() => {
      items.value = items.value.filter(i => i.id !== id)
    }, 2500)
  }
}

defineExpose({ show })
</script>

<style scoped>
.status-toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.status-toast-item {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 100px;
  text-align: center;
}
.toast-hp-up { background-color: var(--success-color); }
.toast-hp-down { background-color: var(--danger-color); }
.toast-exp { background-color: var(--warning-color); }
.toast-mp { background-color: var(--info-color); }
.toast-gp-up { background-color: var(--gold-color); }
.toast-gp-down { background-color: var(--danger-color); }
.toast-default { background-color: var(--hb-primary); }

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
