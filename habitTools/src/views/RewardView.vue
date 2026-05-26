<template>
  <div class="reward-view">
    <TaskList
      v-model="tasks.rewardList"
      type="reward"
      group="reward"
      @detail="onDetail"
      @drag="onDrag"
    />
    <TaskDetail
      v-model="detailVisible"
      type="reward"
      :task="selectedTask"
      @save="onSave"
      @delete="onDelete"
    />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import TaskList from '../components/TaskList.vue'
import TaskDetail from '../components/TaskDetail.vue'

const tasks = inject('tasks')

const detailVisible = ref(false)
const selectedTask = ref(null)

function onDetail(task) {
  selectedTask.value = task
  detailVisible.value = true
}

function onDrag(task, oldIndex, newIndex) {
  tasks.moveTask(task.id, newIndex)
}

function onSave(taskDetails) {
  tasks.saveTask(taskDetails)
}

function onDelete(id) {
  tasks.removeTask(id)
}
</script>

<style scoped>
.reward-view {
  padding: 8px;
}
</style>
