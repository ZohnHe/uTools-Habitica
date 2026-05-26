<template>
  <div class="loading-container">
    <transition name="fade" mode="out-in">
      <img v-show="showImg" src="/img/habitica.png" alt="Habitica" class="loading-logo" />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const showImg = ref(true)
let timer = null
onMounted(() => { timer = setInterval(() => showImg.value = !showImg.value, 500) })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
.loading-logo {
  width: 120px;
  height: 120px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
