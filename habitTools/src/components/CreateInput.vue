<template>
  <div class="create-input-bar">
    <el-input ref="inputRef" v-model="inputText" :placeholder="placeholder" @keyup.enter="submit" clearable />
    <el-button type="primary" @click="submit"><el-icon><Promotion /></el-icon></el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Promotion } from '@element-plus/icons-vue'
const props = defineProps({ menuVal: { type: Number, required: true } })
const emit = defineEmits(['submit'])
const inputRef = ref(null)
const inputText = ref('')
const placeholder = computed(() => {
  switch (props.menuVal) {
    case 1: return '添加一个新习惯...'
    case 2: return '添加一个每日任务...'
    case 3: return '添加一个待办事项...'
    case 4: return '添加一个奖励...'
    case 5: return '发送队伍消息...'
    default: return '键入回车发射'
  }
})
function submit() {
  const text = inputText.value.trim()
  if (!text) return
  emit('submit', text)
  inputText.value = ''
}
function focus() { inputRef.value?.focus() }
defineExpose({ focus })
</script>

<style scoped>
.create-input-bar { display: flex; gap: 8px; padding: 12px 16px; background-color: var(--bg-card); border-top: 1px solid var(--border-color); }
.create-input-bar .el-input { flex: 1; }
</style>
