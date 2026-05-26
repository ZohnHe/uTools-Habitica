<template>
  <div class="habit-view">
    <TaskList
      v-model="tasks.habitList"
      type="habit"
      group="habit"
      @score="onScore"
      @detail="onDetail"
      @drag="onDrag"
    />
    <TaskDetail
      v-model="detailVisible"
      type="habit"
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

function onScore(task, direction) {
  tasks.scoreTask(task, direction)
}

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
.habit-view {
  padding: 8px;
}
</style>
