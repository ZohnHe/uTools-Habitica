<template>
  <div class="daily-view">
    <TaskList
      v-model="tasks.dailyList"
      type="daily"
      group="daily"
      @score="onScore"
      @check="onCheck"
      @detail="onDetail"
      @drag="onDrag"
    />
    <TaskDetail
      v-model="detailVisible"
      type="daily"
      :task="selectedTask"
      @save="onSave"
      @delete="onDelete"
    />
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { scoreHBCheckList } from '../api/habitica.js'
import TaskList from '../components/TaskList.vue'
import TaskDetail from '../components/TaskDetail.vue'

const tasks = inject('tasks')

const detailVisible = ref(false)
const selectedTask = ref(null)

function onScore(task, direction) {
  tasks.scoreTask(task, direction).then(() => {
    if (task.isDue) {
      tasks.undoDailyNum.value = tasks.dailyList.value.filter(d => d.isDue && !d.completed).length
    }
  })
}

function onCheck(taskId, checkListId) {
  scoreHBCheckList(taskId, checkListId)
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
.daily-view {
  padding: 8px;
}
</style>
