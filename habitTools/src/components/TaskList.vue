<template>
  <div class="task-list">
    <VueDraggable v-model="list" :group="group" animation="300" @end="onDragEnd">
      <TaskCard
        v-for="item in list"
        :key="item.id"
        :type="type"
        :task="item"
        @score="(...args) => $emit('score', ...args)"
        @check="(...args) => $emit('check', ...args)"
        @detail="(...args) => $emit('detail', ...args)"
      />
    </VueDraggable>
    <el-empty v-if="!list || list.length === 0" description="暂无内容" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  type: { type: String, required: true },
  group: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue', 'score', 'check', 'detail', 'drag'])

const list = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function onDragEnd(evt) {
  const task = list.value[evt.newIndex]
  emit('drag', task, evt.oldIndex, evt.newIndex)
}
</script>

<style scoped>
.task-list {
  padding: 8px;
}
</style>
