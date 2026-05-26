<template>
  <el-dialog
    v-model="visible"
    title="勾选你昨天做过的任务"
    width="50%"
    :show-close="false"
    center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <TaskCard
      v-for="item in undoneList"
      :key="item.id"
      type="daily"
      :task="item"
      @score="handleScore"
    />
    <template #footer>
      <el-button type="primary" @click="confirm">开始新的一天</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  undoneList: { type: Array, default: () => [] }
})
const emit = defineEmits(['update:modelValue', 'confirm', 'score'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function handleScore(task, direction) {
  task.completed = direction === 'up'
  emit('score', task, direction)
}

function confirm() {
  emit('confirm')
}
</script>

<style scoped>
:deep(.el-dialog) {
  border-radius: 8px;
  background-color: var(--bg-card);
}
:deep(.el-dialog__title) {
  color: var(--text-primary);
}
</style>
